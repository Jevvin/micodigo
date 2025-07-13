// src/app/api/store/products.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");

  if (!restaurantId) {
    return NextResponse.json({ error: "Missing restaurantId" }, { status: 400 });
  }

  // Consultar productos del menú
  const { data, error } = await supabase
    .from("menu_products")
    .select(`
      id,
      name,
      description,
      price,
      image,
      is_available,
      category,
      sort_order
    `)
    .eq("restaurant_id", restaurantId)
    .eq("is_available", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}
