// ✅ Todos los tipos centralizados aquí

export type ExtraItem = {
  id: string | number;
  groupId: string | number;     // Relación con el grupo padre
  name: string;
  price: number;
  stock: number;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;            // ✅ Usado para orden visual en frontend
};

export type ExtraGroup = {
  id: string | number;
  restaurantId: string;
  name: string;
  description?: string;
  ruleType: "single" | "multiple" | "quantity";
  isRequired: boolean;
  maxSelections: number;
  minSelections: number;
  isIncluded: boolean;
  isVisible: boolean;           // ✅ Usado para mostrar u ocultar grupo
  sortOrder: number;            // ✅ Orden de los grupos
  items: ExtraItem[];           // ✅ Siempre debe ser array (aunque vacío), nunca undefined
};

export type Product = {
  id: string;
  categoryId: string;
  restaurantId?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  image?: string;
  sortOrder: number; 
  assignedExtraGroups: {
    extraGroupId: string;
    sortOrder: number;
  }[];
};

export type Category = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  products: Product[];
};
