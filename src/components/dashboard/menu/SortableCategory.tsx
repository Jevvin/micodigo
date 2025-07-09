"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Edit, Plus, Trash2, GripVertical, ImageIcon } from "lucide-react";
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

import SortableProduct from "./SortableProduct";
import CategoryForm from "./CategoryForm";
import ProductForm from "./ProductForm";
import type { Category, Product } from "@/types/menu";

export default function SortableCategory({
  category,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateProduct,
  onDeleteProduct,
}: {
  category: Category;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateProduct: (categoryId: string, product: Product) => void;
  onDeleteProduct: (categoryId: string, productId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleProductDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = category.products.findIndex((p) => p.id === active.id);
      const newIndex = category.products.findIndex((p) => p.id === over.id);
      const newProducts = arrayMove(category.products, oldIndex, newIndex);
      onUpdateCategory({ ...category, products: newProducts });
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value={category.id} className="border rounded-lg mb-4">

          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full mr-4">
              <div className="flex items-center space-x-3">
                <div {...attributes} {...listeners} className="cursor-grab">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? "Activa" : "Inactiva"}
                </Badge>
                <Badge variant="outline">{category.section}</Badge>
                <span className="text-sm text-gray-500">{category.products.length} productos</span>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-4 pb-4 space-y-4">
            {/* Botones para agregar/editar/borrar categoría */}
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditingCategory(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar Categoría
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsAddingProduct(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Producto
                </Button>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar categoría
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Deseas eliminar esta categoría?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Recuerda que todos los productos dentro de ella también se eliminarán.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className={buttonVariants({ variant: "destructive" })}
                      onClick={() => onDeleteCategory(category.id)}
                    >
                      Sí, eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Lista de productos con drag-and-drop */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProductDragEnd}>
              <SortableContext items={category.products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {category.products.map((product) => (
                    <SortableProduct
                      key={product.id}
                      product={product}
                      onEdit={() => setEditingProduct({ ...product })}  // ✅ HACEMOS COPIA AQUÍ
                      onDelete={() => onDeleteProduct(category.id, product.id)}
                      onToggleAvailability={() =>
                        onUpdateProduct(category.id, { ...product, isAvailable: !product.isAvailable })
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {category.products.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay productos en esta categoría</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsAddingProduct(true)}>
                  Agregar primer producto
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Modal para editar categoría */}
      <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>Modifica los detalles de la categoría</DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={category}
            onSave={(updatedCategory) => {
              onUpdateCategory(updatedCategory);
              setIsEditingCategory(false);
            }}
            onCancel={() => setIsEditingCategory(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para agregar/editar producto */}
      <Dialog
        open={isAddingProduct || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingProduct(false);
            setEditingProduct(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Modifica los detalles del producto" : "Agrega un nuevo producto a la categoría"}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            categoryId={category.id}
            product={editingProduct}
            onSave={(product) => {
              onUpdateProduct(category.id, product);
              setIsAddingProduct(false);
              setEditingProduct(null);
            }}
            onCancel={() => {
              setIsAddingProduct(false);
              setEditingProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
