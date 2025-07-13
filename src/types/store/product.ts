/**
 * product.ts
 * 
 * Tipos para productos del menú, extras y grupos de extras.
 */

export interface Product {
  id: number
  restaurant_id: number
  name: string
  description: string
  price: number
  image?: string
  is_available: boolean
  sort_order?: number

  extrasGroups?: ExtraGroup[]
}

export interface ExtraGroup {
  id: number
  restaurant_id: number
  name: string
  description?: string
  type: "single" | "multiple" | "quantity"
  is_required: boolean
  min_selection?: number
  max_selection?: number
  is_free: boolean

  extras: Extra[]
}

export interface Extra {
  id: number
  extra_group_id: number
  name: string
  price: number
  is_available: boolean
  image?: string
}
