/* 📦 PARTE 1 de 3 - Imports y Estado inicial */

"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus, Edit, Trash2, GripVertical, ImageIcon, Eye, EyeOff } from "lucide-react"

// Opcional si usas tipos de Supabase
// import { Database } from "@/types/supabase" 
type Supabase = any

const supabase = createClientComponentClient<Supabase>()

interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string
  isAvailable: boolean
  stock: number
  extras: string[]
}

interface Category {
  id: string
  name: string
  description: string
  section: "platillos" | "postres" | "bebidas"
  isActive: boolean
  sortOrder: number
  products: Product[]
}

/* 📦 PARTE 2 de 3 - Estado, useEffects y Funciones Supabase */

export function MenuCustomizer() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // 📌 Cargar el restaurante del usuario
  useEffect(() => {
    const loadRestaurantId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("restaurants")
        .select("id")
        .eq("user_id", user.id)
        .single()
      setRestaurantId(data?.id ?? null)
    }
    loadRestaurantId()
  }, [])

  // 📌 Cargar menú (categorías + productos)
  useEffect(() => {
    if (!restaurantId) return
    const loadMenu = async () => {
      const { data: catData } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", { ascending: true })
      if (!catData) return

      const categoriesWithProducts: Category[] = []
      for (const cat of catData) {
        const { data: products } = await supabase
          .from("menu_products")
          .select("*")
          .eq("category_id", cat.id)
          .order("sort_order", { ascending: true })

        categoriesWithProducts.push({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          section: cat.section,
          isActive: cat.is_active,
          sortOrder: cat.sort_order,
          products: (products ?? []).map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            stock: p.stock,
            isAvailable: p.is_available,
            extras: p.extras ?? [],
            image: p.image,
          })),
        })
      }
      setCategories(categoriesWithProducts)
    }
    loadMenu()
  }, [restaurantId])

  // 📌 Reordenar categorías
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex((cat) => cat.id === active.id)
    const newIndex = categories.findIndex((cat) => cat.id === over.id)
    const newOrder = arrayMove(categories, oldIndex, newIndex)
    setCategories(newOrder)
    // Guardar sort_order en Supabase
    for (let i = 0; i < newOrder.length; i++) {
      await supabase
        .from("menu_categories")
        .update({ sort_order: i })
        .eq("id", newOrder[i].id)
    }
  }

  // 📌 Crear o actualizar categoría
  const handleSaveCategory = async (category: Category) => {
    if (!restaurantId) return
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
        .single()
      if (data) {
        setCategories([...categories, {
          ...category,
          id: data.id,
          sortOrder: data.sort_order,
          products: [],
        }])
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
        .eq("id", category.id)
      setCategories(categories.map((c) => c.id === category.id ? category : c))
    }
  }
  // 📌 Eliminar categoría
  const handleDeleteCategory = async (categoryId: string) => {
    await supabase.from("menu_categories").delete().eq("id", categoryId)
    await supabase.from("menu_products").delete().eq("category_id", categoryId)
    setCategories(categories.filter((c) => c.id !== categoryId))
  }

  // 📌 Crear o actualizar producto
  const handleUpdateProduct = async (categoryId: string, product: Product) => {
    const cat = categories.find((c) => c.id === categoryId)
    if (!cat) return

    if (product.id.startsWith("prod-")) {
      const { data } = await supabase
        .from("menu_products")
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          is_available: product.isAvailable,
          extras: product.extras,
          category_id: categoryId,
          sort_order: cat.products.length,
        })
        .select()
        .single()
      if (data) {
        const newProduct: Product = { ...product, id: data.id }
        const newCats = categories.map((c) =>
          c.id === categoryId
            ? { ...c, products: [...c.products, newProduct] }
            : c
        )
        setCategories(newCats)
      }
    } else {
      await supabase
        .from("menu_products")
        .update({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          is_available: product.isAvailable,
          extras: product.extras,
        })
        .eq("id", product.id)
      setCategories(categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              products: c.products.map((p) =>
                p.id === product.id ? product : p
              ),
            }
          : c
      ))
    }
  }

  // 📌 Eliminar producto
  const handleDeleteProduct = async (categoryId: string, productId: string) => {
    await supabase.from("menu_products").delete().eq("id", productId)
    setCategories(categories.map((c) =>
      c.id === categoryId
        ? { ...c, products: c.products.filter((p) => p.id !== productId) }
        : c
    ))
  }

  // 📌 Render del componente
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
                {categories.map((category) => (
                  <SortableCategory
                    key={category.id}
                    category={category}
                    onUpdateCategory={handleSaveCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                  />
                ))}
              </Accordion>
            </SortableContext>
          </DndContext>

          {categories.length === 0 && (
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
              handleSaveCategory(category)
              setIsAddingCategory(false)
            }}
            onCancel={() => setIsAddingCategory(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 🟣 SortableCategory - Componente de la categoría con drag & drop y dialog para editar
function SortableCategory({
  category,
  onUpdateCategory,
  onDeleteCategory,
  onUpdateProduct,
  onDeleteProduct,
}: {
  category: Category
  onUpdateCategory: (category: Category) => void
  onDeleteCategory: (categoryId: string) => void
  onUpdateProduct: (categoryId: string, product: Product) => void
  onDeleteProduct: (categoryId: string, productId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [isEditingCategory, setIsEditingCategory] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  const handleProductDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = category.products.findIndex((p) => p.id === active.id)
      const newIndex = category.products.findIndex((p) => p.id === over.id)
      const newProducts = arrayMove(category.products, oldIndex, newIndex)
      onUpdateCategory({ ...category, products: newProducts })
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
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
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
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
              <Button variant="destructive" size="sm" onClick={() => onDeleteCategory(category.id)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar Categoría
              </Button>
            </div>

            <DndContext
              sensors={useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))}
              collisionDetection={closestCenter}
              onDragEnd={handleProductDragEnd}
            >
              <SortableContext items={category.products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {category.products.map((product) => (
                    <SortableProduct
                      key={product.id}
                      product={product}
                      onEdit={() => setEditingProduct(product)}
                      onDelete={() => onDeleteProduct(category.id, product.id)}
                      onToggleAvailability={() => onUpdateProduct(category.id, { ...product, isAvailable: !product.isAvailable })}
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
          </div>
        </AccordionContent>
      </AccordionItem>

      <Dialog open={isEditingCategory} onOpenChange={setIsEditingCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
            <DialogDescription>Modifica los detalles de la categoría</DialogDescription>
          </DialogHeader>
          <CategoryForm
            category={category}
            onSave={(updatedCategory) => {
              onUpdateCategory(updatedCategory)
              setIsEditingCategory(false)
            }}
            onCancel={() => setIsEditingCategory(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingProduct || !!editingProduct} onOpenChange={(open) => {
        if (!open) {
          setIsAddingProduct(false)
          setEditingProduct(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
            <DialogDescription>{editingProduct ? "Modifica los detalles del producto" : "Agrega un nuevo producto a la categoría"}</DialogDescription>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSave={(product) => {
              onUpdateProduct(category.id, product)
              setIsAddingProduct(false)
              setEditingProduct(null)
            }}
            onCancel={() => {
              setIsAddingProduct(false)
              setEditingProduct(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 🟣 SortableProduct - Componente de cada producto con drag & drop
function SortableProduct({
  product,
  onEdit,
  onDelete,
  onToggleAvailability,
}: {
  product: Product
  onEdit: () => void
  onDelete: () => void
  onToggleAvailability: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 border rounded-lg bg-white">
      <div className="flex items-center space-x-3">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          <ImageIcon className="h-6 w-6 text-gray-400" />
        </div>
        <div>
          <h4 className="font-medium">{product.name}</h4>
          <p className="text-sm text-gray-500">
            ${product.price} • Stock: {product.stock}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={product.isAvailable ? "default" : "secondary"}>
          {product.isAvailable ? "Disponible" : "No disponible"}
        </Badge>
        <Button variant="ghost" size="sm" onClick={onToggleAvailability}>
          {product.isAvailable ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// 📌 FORMULARIO PARA CREAR O EDITAR UNA CATEGORÍA
function CategoryForm({
  category,
  onSave,
  onCancel,
}: {
  category?: Category
  onSave: (category: Category) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    section: category?.section || ("platillos" as const),
    isActive: category?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newCategory: Category = {
      id: category?.id || `cat-${Date.now()}`,
      ...formData,
      sortOrder: category?.sortOrder || 0,
      products: category?.products || [],
    }
    onSave(newCategory)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre de la categoría</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="section">Sección</Label>
        <Select
          value={formData.section}
          onValueChange={(value: any) => setFormData({ ...formData, section: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="platillos">Platillos</SelectItem>
            <SelectItem value="postres">Postres</SelectItem>
            <SelectItem value="bebidas">Bebidas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
        />
        <Label htmlFor="isActive">Categoría activa</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  )
}

// 📌 FORMULARIO PARA CREAR O EDITAR UN PRODUCTO
function ProductForm({
  product,
  onSave,
  onCancel,
}: {
  product?: Product | null
  onSave: (product: Product) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    stock: product?.stock || 0,
    isAvailable: product?.isAvailable ?? true,
    extras: product?.extras?.join(", ") || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newProduct: Product = {
      id: product?.id || `prod-${Date.now()}`,
      ...formData,
      extras: formData.extras
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e),
    }
    onSave(newProduct)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre del producto</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="stock">Stock inicial</Label>
        <Input
          id="stock"
          type="number"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
          required
        />
      </div>
      <div>
        <Label htmlFor="extras">Extras disponibles (separados por comas)</Label>
        <Input
          id="extras"
          value={formData.extras}
          onChange={(e) => setFormData({ ...formData, extras: e.target.value })}
          placeholder="Queso extra, Aguacate, Salsa picante"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isAvailable"
          checked={formData.isAvailable}
          onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
        />
        <Label htmlFor="isAvailable">Producto disponible</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  )
}
