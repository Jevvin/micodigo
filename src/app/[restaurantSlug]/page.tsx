"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, notFound, useRouter } from "next/navigation";
import { supabase } from "@/app/utils/supabaseClient";
import RestaurantHeader from "@/components/store/header/RestaurantHeader";
import RestaurantStatusBadge from "@/components/store/header/RestaurantStatusBadge";
import RestaurantInfoModal from "@/components/store/infoModal/RestaurantInfoModal";
import StickyCategoryTabs from "@/components/store/menu/StickyCategoryTabs";
import MenuSection, { normalizeTitleToId } from "@/components/store/menu/MenuSection";
import ProductDetailsModal from "@/components/store/menu/ProductDetailsModal";
import CartDrawer from "@/components/store/cart/CartDrawer";
import CheckoutModal from "@/components/store/cart/CheckoutModal";
import useCartStore from "@/hooks/store/useCart";
import useCheckout from "@/hooks/store/useCheckout";
import { CustomerInfo } from "@/types/store/order";
import { Product } from "@/types/store/product";
import { useStoreMenu } from "@/hooks/store/useStoreMenu";
import { useExtrasCache } from "@/hooks/store/useExtrasCache";
import ProcessingOrderModal from "@/components/store/cart/ProcessingOrderModal";
import CartButton from "@/components/store/cart/CartButton";
import { CartItem } from "@/types/store/cart";
import useProductModal from "@/hooks/store/useProductModal";
import { useRestaurantStore } from "@/hooks/store/useRestaurantStore";

function OrderTypeSelector() {
  const { orderType, setOrderType } = useRestaurantStore();
  return (
    <div className="w-full max-w-md mx-auto my-4 flex justify-center gap-4">
      <button
        onClick={() => setOrderType("delivery")}
        className={`px-4 py-2 rounded-lg ${
          orderType === "delivery" ? "bg-black text-white" : "bg-gray-200 text-black"
        }`}
      >
        A domicilio
      </button>
      <button
        onClick={() => setOrderType("pickup")}
        className={`px-4 py-2 rounded-lg ${
          orderType === "pickup" ? "bg-black text-white" : "bg-gray-200 text-black"
        }`}
      >
        Para llevar
      </button>
    </div>
  );
}
export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantSlug = params.restaurantSlug as string;

  const { restaurant, categories, products, loading } = useStoreMenu(restaurantSlug);
  const { orderType, setOrderType } = useRestaurantStore();

  const [isProcessingOpen, setIsProcessingOpen] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [cities, setCities] = useState<{ id: number; name: string; state: string }[]>([]);
  const [lastOrderData, setLastOrderData] = useState<{
    customer: CustomerInfo;
    address: any;
    paymentMethod: "cash" | "card";
  } | null>(null);

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
    updateItem,
    clearCart,
    increaseQty,
    decreaseQty,
  } = useCartStore();

  const { getExtrasForProduct } = useExtrasCache();
  const checkout = useCheckout(items, restaurant?.id ?? 0);

  const {
    isOpen: showProductModal,
    selectedProduct,
    mode,
    cartItem,
    openAddModal,
    openEditModal,
    closeModal,
  } = useProductModal();

  const [extraGroups, setExtraGroups] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || "");
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Normaliza texto
  const normalize = (str: string) => str.replace(/\s+/g, "-").toLowerCase();

  useEffect(() => {
    if (!restaurant && !loading) notFound();
  }, [restaurant, loading]);

  useEffect(() => {
    if (restaurant?.accepts_delivery && !restaurant?.accepts_pickup) {
      setOrderType("delivery");
    } else if (!restaurant?.accepts_delivery && restaurant?.accepts_pickup) {
      setOrderType("pickup");
    } else {
      setOrderType(null);
    }
  }, [restaurant, setOrderType]);

  const fetchCities = async () => {
    try {
      const { data } = await supabase
        .from("cities")
        .select("id, name, state")
        .order("name", { ascending: true });
      if (data) setCities(data);
    } catch {
      setCities([]);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchExtrasForProduct = async (productId: number) => {
    const { data } = await supabase
      .from("product_extra_groups")
      .select(`id, sort_order, extra_groups (
        id, name, description, rule_type, is_required, is_included,
        max_selections, min_selections, is_visible,
        extras (id, name, price, stock, is_active, sort_order)
      )`)
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (data) {
      const groups = data.map((row) => {
        const group = Array.isArray(row.extra_groups)
          ? row.extra_groups[0]
          : row.extra_groups;
        if (!group || !group.is_visible) return null;
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          ruleType: group.rule_type,
          isRequired: group.is_required,
          isIncluded: group.is_included,
          maxSelections: group.max_selections,
          minSelections: group.min_selections,
          extras: [...(group.extras ?? [])].sort((a, b) => a.sort_order - b.sort_order),
          sortOrder: row.sort_order,
        };
      }).filter(Boolean);
      setExtraGroups(groups);
    } else {
      setExtraGroups([]);
    }
  };

  const handleProductClick = async (product: Product) => {
    const cachedExtras = getExtrasForProduct(product.id);
    if (cachedExtras?.length) {
      setExtraGroups(cachedExtras);
    } else {
      await fetchExtrasForProduct(product.id);
    }
    openAddModal(product);
  };

  const handleEditItem = async (index: number) => {
    const item = items[index];
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;

    const cachedExtras = getExtrasForProduct(product.id);
    if (cachedExtras?.length) {
      setExtraGroups(cachedExtras);
    } else {
      await fetchExtrasForProduct(product.id);
    }

    openEditModal(product, item);
  };

  const handleUpdateItem = (updatedItem: CartItem) => {
    if (cartItem && mode === "edit") {
      const index = items.findIndex((i) => i === cartItem);
      if (index !== -1) updateItem(index, updatedItem);
    }
    closeModal();
  };

  const handleAddToCart = (item: CartItem) => {
    addItem(item);
    openDrawer();
    closeModal();
  };

  const handleProceedToCheckout = () => {
    closeDrawer();
    openCheckout();
  };

  const handleConfirmOrder = async (orderDataFromForm: {
    customer: CustomerInfo;
    address: any;
    paymentMethod: "cash" | "card";
  }) => {
    if (items.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    setIsProcessingOpen(true);
    setProcessingError(null);
    setLastOrderData(orderDataFromForm);

    try {
      const fullOrderData = {
        restaurantId: restaurant?.id,
        customer: orderDataFromForm.customer,
        address: orderDataFromForm.address,
        paymentMethod: orderDataFromForm.paymentMethod,
        items,
        total: checkout.total,
        deliveryType: orderType || "delivery",
        specialInstructions: "",
      };

      const confirmedOrder = await checkout.submitOrder(fullOrderData);
      if (!confirmedOrder) throw new Error("No se pudo confirmar el pedido");

      localStorage.setItem("confirmed_order", JSON.stringify(confirmedOrder));
      clearCart();
      closeCheckout();
      setIsProcessingOpen(false);
      router.push("/pedido-confirmado");
    } catch (err: any) {
      console.error("❌ ERROR AL GUARDAR ORDEN:", err);
      setProcessingError(err.message || "Error desconocido");
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          const sorted = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          const id = sorted[0].target.id.replace("category-", "");
          const matched = categories.find((c) => normalize(c) === id);
          if (matched) setSelectedCategory(matched);
        }
      },
      {
        root: null,
        rootMargin: "-64px 0px 0px 0px",
        threshold: 0.1,
      }
    );

    const elements = categories
      .map((c) => categoryRefs.current[normalize(c)])
      .filter(Boolean) as HTMLDivElement[];

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  if (!restaurant) return null;

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

      {items.length > 0 && !isDrawerOpen && !isCheckoutOpen && restaurant?.accepting_orders && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <CartButton
            count={items.reduce((total, item) => total + item.quantity, 0)}
            onClick={openDrawer}
          />
        </div>
      )}

      <div className="-mt-6 mx-4 mb-6 relative z-10">
        <RestaurantHeader
          restaurant={restaurant}
          statusText={statusText}
          onOpenInfo={() => setShowInfoModal(true)}
        />
      </div>

      <RestaurantInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        restaurant={restaurant}
        statusText={statusText}
      />

      {restaurant.accepts_delivery && restaurant.accepts_pickup && <OrderTypeSelector />}

      <StickyCategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryClick={(category) => {
          setSelectedCategory(category);
          const el = categoryRefs.current[normalize(category)];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }}
      />

      <div className="w-[95%] max-w-7xl mx-auto space-y-12 mt-6">
        {loading ? (
          <p className="text-center text-gray-500">Cargando menú...</p>
        ) : (
          categories.map((category) => {
            const categoryProducts = products.filter(
              (p) => p.menu_categories?.name === category
            );
            return (
              <div
                key={category}
                id={`category-${normalize(category)}`}
                ref={(el) => {
                  if (el) categoryRefs.current[normalize(category)] = el;
                }}
              >
                <MenuSection
  key={category}
  ref={(el) => {
    if (el) categoryRefs.current[normalizeTitleToId(category)] = el;
  }}
  title={category}
  products={categoryProducts}
  onSelectProduct={handleProductClick}
/>
              </div>
            );
          })
        )}
      </div>

      <ProductDetailsModal
        open={showProductModal}
        onClose={closeModal}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onUpdateItem={handleUpdateItem}
        extraGroups={extraGroups}
        mode={mode}
        cartItem={cartItem}
      />

      <CartDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        cartItems={items}
        onRemoveItem={removeItem}
        onIncreaseQty={increaseQty}
        onDecreaseQty={decreaseQty}
        onProceedToCheckout={handleProceedToCheckout}
        allProducts={products}
        restaurantName={restaurant?.name || "Restaurante"}
        onAddSuggestedProduct={handleProductClick}
        onEditItem={handleEditItem}
      />

      <CheckoutModal
        open={isCheckoutOpen}
        onClose={closeCheckout}
        cartItems={items}
        onRemoveItem={removeItem}
        onConfirm={handleConfirmOrder}
        fetchCities={fetchCities}
        cities={cities}
      />

      <ProcessingOrderModal
        open={isProcessingOpen}
        error={processingError}
        onRetry={async () => {
          if (lastOrderData) await handleConfirmOrder(lastOrderData);
        }}
        onClose={() => {
          setIsProcessingOpen(false);
          setProcessingError(null);
        }}
      />
    </div>
  );
}
