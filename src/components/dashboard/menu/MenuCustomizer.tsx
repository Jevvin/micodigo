"use client";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Accordion } from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, ImageIcon } from "lucide-react";
import { useState } from "react";

import CategoryForm from "./CategoryForm";
import SortableCategory from "./SortableCategory";
import { useMenuManager } from "@/hooks/dashboard/useMenuManager";

export default function MenuCustomizer() {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const {
    categories,
    handleReorderCategories,
    handleReorderProducts,
    handleDeleteCategory,
    handleDeleteProduct,
    handleSaveCategory,
    handleUpdateProduct,
  } = useMenuManager();

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((cat) => cat.id === active.id);
    const newIndex = categories.findIndex((cat) => cat.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...categories];
    const moved = newOrder.splice(oldIndex, 1)[0];
    newOrder.splice(newIndex, 0, moved);

    handleReorderCategories(newOrder);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Personalizar Menú</h2>
          <p className="text-gray-600">
            Organiza tus categorías y productos con arrastrar y soltar
          </p>
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
            <SortableContext
              items={categories.map((cat) => cat.id)}
              strategy={verticalListSortingStrategy}
            >
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
                      onReorderProducts={handleReorderProducts} // ✅ nuevo
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
