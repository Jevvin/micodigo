// src/app/api/store/tracking/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  console.log("[TRACKING] orderId recibido:", orderId);

  if (!orderId) {
    console.warn("[TRACKING] No se proporcionó orderId");
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status
    `)
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("[TRACKING] Error al consultar Supabase:", error);
    return NextResponse.json(
      { error: error.message || "Error desconocido al consultar el pedido" },
      { status: 500 }
    );
  }

  console.log("[TRACKING] Pedido encontrado:", data);

  return NextResponse.json({ order: data });
}
