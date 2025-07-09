// ✅ Todos los tipos centralizados aquí

export type ExtraGroup = {
  id: string;
  restaurantId?: string;
  name: string;
  description: string;
  ruleType: "single" | "multiple" | "quantity";
  isRequired: boolean;
  maxSelections: number;
  minSelections: number;
  isIncluded: boolean;
  sortOrder: number;
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
  assignedExtraGroups: {
    extraGroupId: string;
    sortOrder: number;
  }[];
};

export type Category = {
  id: string;
  name: string;
  description: string;
  section: "platillos" | "postres" | "bebidas";
  isActive: boolean;
  sortOrder: number;
  products: Product[];
};
