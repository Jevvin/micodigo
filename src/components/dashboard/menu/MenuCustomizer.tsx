"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ImageIcon } from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext,
  sortableKeyboardCoordinates, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Accordion } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

import CategoryForm from "./CategoryForm";
import SortableCategory from "./SortableCategory";
import { Category, Product } from "@/types/menu";

const supabase = createClientComponentClient<any>();

export default function MenuCustomizer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ✅ Cargar restaurantId
  useEffect(() => {
    const loadRestaurantId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("restaurants")
        .select("id")
        .eq("user_id", user.id)
        .single();
      setRestaurantId(data?.id ?? null);
    };
    loadRestaurantId();
  }, []);

  // ✅ Cargar categorías y productos SIN JOIN
  useEffect(() => {
    if (!restaurantId) return;

    const loadMenu = async () => {
      const { data: catData } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", { ascending: true });

      if (!catData) return;

      const categoriesWithProducts: Category[] = [];

      for (const cat of catData) {
        const { data: products } = await supabase
          .from("menu_products")
          .select("*")
          .eq("category_id", cat.id)
          .order("sort_order", { ascending: true });

        const productsWithExtras: Product[] = [];

        for (const p of products ?? []) {
          const { data: assignedExtras } = await supabase
            .from("product_extra_groups")
            .select("*")
            .eq("product_id", p.id)
            .order("sort_order", { ascending: true });

          productsWithExtras.push({
  id: p.id,
  categoryId: p.category_id,
  restaurantId: p.restaurant_id,
  name: p.name,
  description: p.description,
  price: p.price,
  stock: p.stock ?? 0,
  isAvailable: p.is_available,
  image: p.image,
  assignedExtraGroups: (assignedExtras ?? []).map((item) => ({
    extraGroupId: item.extra_group_id,
    sortOrder: item.sort_order,
  })),
});

        }

        categoriesWithProducts.push({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          section: cat.section,
          isActive: cat.is_active,
          sortOrder: cat.sort_order,
          products: productsWithExtras,
        });
      }

      setCategories(categoriesWithProducts);
    };

    loadMenu();
  }, [restaurantId]);

  // ✅ Reordenar categorías
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);
    const newOrder = arrayMove(categories, oldIndex, newIndex);
    setCategories(newOrder);
    for (let i = 0; i < newOrder.length; i++) {
      await supabase
        .from("menu_categories")
        .update({ sort_order: i })
        .eq("id", newOrder[i].id);
    }
  };

  // ✅ Guardar (crear o actualizar) categoría
  const handleSaveCategory = async (category: Category) => {
    if (!restaurantId) return;

    if (category.id.startsWith("cat-")) {
      const { data } = await supabase
        .from("menu_categories")
        .insert({
          name: category.name,
          description: category.description,
          section: category.section,
          is_active: category.isActive,
          restaurant_id: restaurantId,
          sort_order: categories.length,
        })
        .select()
        .single();

      if (data) {
        setCategories([
          ...categories,
          {
            ...category,
            id: data.id,
            sortOrder: data.sort_order,
            products: [],
          },
        ]);
        toast({
          title: "Categoría guardada exitosamente",
          description: "Los cambios se han guardado correctamente.",
        });
      }
    } else {
      await supabase
        .from("menu_categories")
        .update({
          name: category.name,
          description: category.description,
          section: category.section,
          is_active: category.isActive,
        })
        .eq("id", category.id);
      setCategories(categories.map((c) => (c.id === category.id ? category : c)));

      toast({
        title: "Categoría guardada exitosamente",
        description: "Los cambios se han guardado correctamente.",
      });
    }
  };

  // ✅ Eliminar categoría
  const handleDeleteCategory = async (categoryId: string) => {
    await supabase.from("menu_categories").delete().eq("id", categoryId);
    await supabase.from("menu_products").delete().eq("category_id", categoryId);
    setCategories(categories.filter((c) => c.id !== categoryId));
    toast({
      title: "Categoría eliminada exitosamente",
      description: "La categoría se ha eliminado correctamente.",
    });
  };

  // ✅ Crear o actualizar producto (ya escribe en menu_products)
  const handleUpdateProduct = async (categoryId: string, product: Product) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat || !restaurantId) return;

    if (String(product.id).startsWith("prod-")) {
      const { data: newProd } = await supabase
        .from("menu_products")
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          is_available: product.isAvailable,
          image: product.image,
          category_id: categoryId,
          restaurant_id: restaurantId,
          sort_order: cat.products.length,
        })
        .select()
        .single();

      if (!newProd) return;

      for (const assigned of product.assignedExtraGroups) {
        await supabase
          .from("product_extra_groups")
          .insert({
            product_id: newProd.id,
            extra_group_id: assigned.extraGroupId,
            sort_order: assigned.sortOrder,
          });
      }

      const newProduct: Product = {
        ...product,
        id: newProd.id,
        categoryId,
        restaurantId,
      };
      const newCats = categories.map((c) =>
        c.id === categoryId
          ? { ...c, products: [...c.products, newProduct] }
          : c
      );
      setCategories(newCats);

      toast({
        title: "Producto guardado exitosamente",
        description: "Los cambios se han guardado correctamente.",
      });
    } else {
      await supabase
        .from("menu_products")
        .update({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          is_available: product.isAvailable,
          image: product.image,
          restaurant_id: restaurantId,
          category_id: categoryId,
        })
        .eq("id", product.id);

      await supabase
        .from("product_extra_groups")
        .delete()
        .eq("product_id", product.id);

      for (const assigned of product.assignedExtraGroups) {
        await supabase
          .from("product_extra_groups")
          .insert({
            product_id: product.id,
            extra_group_id: assigned.extraGroupId,
            sort_order: assigned.sortOrder,
          });
      }

      setCategories(categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map((p) =>
                p.id === product.id
                  ? { ...product, categoryId, restaurantId }
                  : p
              ),
            }
          : c
      ));

      toast({
        title: "Producto guardado exitosamente",
        description: "Los cambios se han guardado correctamente.",
      });
    }
  };

  // ✅ Eliminar producto
  const handleDeleteProduct = async (categoryId: string, productId: string) => {
    await supabase.from("menu_products").delete().eq("id", productId);
    await supabase.from("product_extra_groups").delete().eq("product_id", productId);
    setCategories(categories.map((c) =>
      c.id === categoryId
        ? { ...c, products: c.products.filter((p) => p.id !== productId) }
        : c
    ));
    toast({
      title: "Producto eliminado exitosamente",
      description: "El producto se ha eliminado correctamente.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Personalizar Menú</h2>
          <p className="text-gray-600">Organiza tus categorías y productos con arrastrar y soltar</p>
        </div>
        <Button onClick={() => setIsAddingCategory(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Categoría
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categorías del Menú</CardTitle>
          <CardDescription>
            Arrastra las categorías para cambiar su orden. Haz clic en una categoría para ver y organizar sus productos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={categories.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
              <Accordion type="multiple" className="w-full">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SortableCategory
                      key={category.id}
                      category={category}
                      onUpdateCategory={handleSaveCategory}
                      onDeleteCategory={handleDeleteCategory}
                      onUpdateProduct={handleUpdateProduct}
                      onDeleteProduct={handleDeleteProduct}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No hay categorías</h3>
                    <p className="mb-4">Comienza agregando tu primera categoría de productos</p>
                    <Button onClick={() => setIsAddingCategory(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Primera Categoría
                    </Button>
                  </div>
                )}
              </Accordion>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>

      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Categoría</DialogTitle>
            <DialogDescription>Crea una nueva categoría para organizar tus productos</DialogDescription>
          </DialogHeader>
          <CategoryForm
            onSave={(category) => {
              handleSaveCategory(category);
              setIsAddingCategory(false);
            }}
            onCancel={() => setIsAddingCategory(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
