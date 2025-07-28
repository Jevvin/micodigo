/**
 * product.ts
 * 
 * Tipos para productos del menú, extras y grupos de extras.
 */

export type RuleType = "single" | "multiple" | "quantity";

export interface Product {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  is_available: boolean;
  sort_order?: number;

  // Relación con grupos de extras
  extrasGroups?: ExtraGroup[];

  // Relación opcional con la categoría del menú
  menu_categories?: {
    name: string;
    sort_order: number;
    is_active: boolean;
  };
}

export interface ExtraGroup {
  id: number;
  restaurant_id: number;
  name: string;
  description?: string;
  ruleType: RuleType;
  isRequired: boolean;
  minSelection?: number;
  maxSelection?: number;
  isIncluded?: boolean;
  isVisible: boolean;
  sortOrder: number;

  extras?: Extra[]; // Opcional por si no se cargan aún
}

export interface Extra {
  id: number;
  extra_group_id: number;
  name: string;
  price: number;
  is_available: boolean;
  sort_order: number;
  image?: string;
  stock?: number;
}
