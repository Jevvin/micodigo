"use client";

/**
 * RestaurantPage
 * 
 * Página principal del restaurante.
 * - Muestra portada, tabs, lista de productos
 * - Modal de producto con selección de extras
 * - Carrito, checkout
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/utils/supabaseClient";
import { Restaurant } from "@/types/store/store";
import { Product } from "@/types/store/product";
import RestaurantHeader from "@/components/store/header/RestaurantHeader";
import RestaurantStatusBadge from "@/components/store/header/RestaurantStatusBadge";
import RestaurantInfoModal from "@/components/store/infoModal/RestaurantInfoModal";
import RestaurantTabs from "@/components/store/menu/RestaurantTabs";
import ProductList from "@/components/store/menu/ProductList";
import ProductDetailsModal from "@/components/store/menu/ProductDetailsModal";
import CartDrawer from "@/components/store/cart/CartDrawer";
import CheckoutModal from "@/components/store/cart/CheckoutModal";
import useCartStore from "@/hooks/store/useCart";
import useCheckout from "@/hooks/store/useCheckout";

export default function RestaurantPage() {
  const params = useParams();
  const restaurantSlug = params.restaurantSlug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);

  const {
    isDrawerOpen,
    isCheckoutOpen,
    openDrawer,
    closeDrawer,
    openCheckout,
    closeCheckout,
    items,
    removeItem,
    addItem,
    clearCart,
  } = useCartStore();

  const checkout = useCheckout(items, restaurant?.id ?? 0);

  const [categories, setCategories] = useState<string[]>(["Platillos", "Postres", "Bebidas"]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);

  // Modal product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [extraGroups, setExtraGroups] = useState<any[]>([]);

  /**
   * ✅ Cargar grupos de extras asignados a un producto
   */
    const fetchExtrasForProduct = async (productId: number) => {
    const { data, error } = await supabase
      .from("product_extra_groups")
      .select(`
        id,
        sort_order,
        extra_group (
          id,
          name,
          description,
          rule_type,
          is_required,
          is_included,
          max_selections,
          min_selections,
          extras (
            id,
            name,
            price,
            stock,
            is_active
          )
        )
      `)
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error cargando extras:", error);
      setExtraGroups([]);
      return;
    }

    if (!data || data.length === 0) {
      setExtraGroups([]);
      return;
    }

    // ✅ Mapear resultados CORRECTAMENTE
    const groups = data
      .filter((row) => Array.isArray(row.extra_group) && row.extra_group.length > 0)
      .map((row) => {
        const group = row.extra_group[0];
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          ruleType: group.rule_type,
          isRequired: group.is_required,
          isIncluded: group.is_included,
          maxSelections: group.max_selections,
          minSelections: group.min_selections,
          extras: group.extras ?? [],
          sortOrder: row.sort_order,
        };
      });

    setExtraGroups(groups);
  };


  /**
   * ✅ Al abrir modal de producto
   */
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    fetchExtrasForProduct(product.id);
  };

  const handleAddToCart = (item: any) => {
    addItem(item);
    openDrawer();
  };

  const handleProceedToCheckout = () => {
    closeDrawer();
    openCheckout();
  };

  const handleConfirmOrder = async () => {
    if (items.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    if (!checkout.isValid()) {
      alert("Por favor completa los datos del cliente y método de pago");
      return;
    }

    const orderPayload = checkout.generateOrderPayload();

    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert([
          {
            restaurant_id: restaurant?.id,
            customer_id: null,
            delivery_type: "delivery",
            payment_method: orderPayload.paymentMethod,
            total: orderPayload.total,
            status: "new",
            special_instructions: orderPayload.customer.notes,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const itemsToInsert = orderPayload.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.price,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      clearCart();
      closeCheckout();

      alert("¡Pedido guardado exitosamente!");

    } catch (err: any) {
      console.error("Error al guardar la orden:", err.message);
      alert("Hubo un problema al guardar tu pedido.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data: restaurantData, error } = await supabase
        .from("restaurants")
        .select("*, restaurant_hours(*)")
        .eq("slug", restaurantSlug)
        .single();

      if (error || !restaurantData) {
        setRestaurant(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      setRestaurant(restaurantData);

      const { data: productsData } = await supabase
        .from("menu_products")
        .select("*")
        .eq("restaurant_id", restaurantData.id)
        .eq("is_available", true)
        .order("sort_order", { ascending: true });

      setProducts(productsData || []);
      setLoading(false);
    };

    if (restaurantSlug) fetchData();
  }, [restaurantSlug]);

  useEffect(() => {
    const updateStatus = () => {
      if (!restaurant || !restaurant.restaurant_hours) {
        setStatusText("Cerrado");
        return;
      }

      const now = new Date();
      const day = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      const todayHours = restaurant.restaurant_hours.find(
        (h) => h.day_of_week === day
      );

      if (!todayHours || !todayHours.is_open || !todayHours.open_time || !todayHours.close_time) {
        setStatusText("Cerrado");
        return;
      }

      const [openH, openM] = todayHours.open_time.split(":").map(Number);
      const [closeH, closeM] = todayHours.close_time.split(":").map(Number);

      const openDate = new Date(now);
      openDate.setHours(openH, openM, 0, 0);

      const closeDate = new Date(now);
      closeDate.setHours(closeH, closeM, 0, 0);

      const minsToOpen = Math.floor((openDate.getTime() - now.getTime()) / 60000);
      const minsToClose = Math.floor((closeDate.getTime() - now.getTime()) / 60000);

      if (minsToOpen > 0 && minsToOpen <= 30) {
        setStatusText(`Abre en ${minsToOpen} min`);
      } else if (now >= openDate && now <= closeDate) {
        if (minsToClose > 0 && minsToClose <= 30) {
          setStatusText(`Cierra en ${minsToClose} min`);
        } else {
          setStatusText("Abierto");
        }
      } else {
        setStatusText("Cerrado");
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, [restaurant]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-lg">Cargando restaurante...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-red-500">Restaurante no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PORTADA */}
      <div className="relative">
        <img
          src={restaurant.cover_image_url || "/placeholder.svg"}
          alt={`Portada de ${restaurant.name}`}
          className="w-full h-64 md:h-80 object-cover rounded-b-2xl"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-b-2xl" />
        <div className="absolute top-4 right-4">
          <RestaurantStatusBadge statusText={statusText} />
        </div>
      </div>

      {/* HEADER */}
      <div className="-mt-6 mx-4 mb-6 relative z-10">
        <RestaurantHeader
          restaurant={restaurant}
          statusText={statusText}
          onOpenInfo={() => setShowInfoModal(true)}
          onOpenCart={openDrawer}
        />
      </div>

      {/* INFO MODAL */}
      <RestaurantInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        restaurant={restaurant}
        statusText={statusText}
      />

      {/* MENÚ TABS y LISTA */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <RestaurantTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => setSelectedCategory(category)}
        />
        <ProductList
          products={products}
          onProductClick={handleProductClick}
        />
      </div>

      {/* PRODUCT DETAILS MODAL */}
      <ProductDetailsModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        extraGroups={extraGroups}
      />

      {/* CART DRAWER */}
      <CartDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        cartItems={items}
        onRemoveItem={(index) => removeItem(index)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* CHECKOUT */}
      <CheckoutModal
        open={isCheckoutOpen}
        onClose={closeCheckout}
        cartItems={items}
        onRemoveItem={removeItem}
        onConfirm={handleConfirmOrder}
      />
    </div>
  );
}
