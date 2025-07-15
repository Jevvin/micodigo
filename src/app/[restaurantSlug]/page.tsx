"use client";

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

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [extraGroups, setExtraGroups] = useState<any[]>([]);

  const [cities, setCities] = useState<{ id: number; name: string; state: string }[]>([]);

  /** ✅ Cargar lista de ciudades desde Supabase */
  const fetchCities = async () => {
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name, state")
        .order("name", { ascending: true });

      if (error) {
        console.error("❌ Error cargando ciudades:", error);
        setCities([]);
      } else {
        setCities(data || []);
      }
    } catch (err) {
      console.error("❌ Error general al cargar ciudades:", err);
      setCities([]);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  /**
   * ✅ Cargar grupos de extras asignados a un producto
   */
  const fetchExtrasForProduct = async (productId: number) => {
    const { data, error } = await supabase
      .from("product_extra_groups")
      .select(`
        id,
        sort_order,
        extra_groups (
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

    if (error || !data) {
      console.error("❌ Error cargando extras:", error);
      setExtraGroups([]);
      return;
    }

    const groups = data
      .filter((row) => row.extra_groups !== null)
      .map((row) => {
        const group = row.extra_groups as any;
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

  /** ✅ Al abrir modal de producto */
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

  /** ✅ Confirmar y guardar orden vía API */
  const handleConfirmOrder = async (orderPayload: any) => {
    if (items.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    try {
      const response = await fetch("/api/store/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: restaurant?.id,
          customer: orderPayload.customer,
          address: orderPayload.address,
          items: orderPayload.items,
          total: orderPayload.total,
          paymentMethod: orderPayload.paymentMethod,
          deliveryType: "delivery",
          specialInstructions: orderPayload.customer?.notes || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error desconocido");
      }

      clearCart();
      closeCheckout();
      alert("¡Pedido guardado exitosamente!");
    } catch (err: any) {
      console.error("❌ ERROR AL GUARDAR ORDEN:", err);
      alert(`Hubo un problema al guardar tu pedido: ${err.message || JSON.stringify(err)}`);
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

      <div className="-mt-6 mx-4 mb-6 relative z-10">
        <RestaurantHeader
          restaurant={restaurant}
          statusText={statusText}
          onOpenInfo={() => setShowInfoModal(true)}
          onOpenCart={openDrawer}
        />
      </div>

      <RestaurantInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        restaurant={restaurant}
        statusText={statusText}
      />

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

      <ProductDetailsModal
        open={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        extraGroups={extraGroups}
      />

      <CartDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        cartItems={items}
        onRemoveItem={(index) => removeItem(index)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        open={isCheckoutOpen}
        onClose={closeCheckout}
        cartItems={items}
        onRemoveItem={removeItem}
        onConfirm={handleConfirmOrder}
        fetchCities={fetchCities}
        cities={cities || []}
      />
    </div>
  );
}
