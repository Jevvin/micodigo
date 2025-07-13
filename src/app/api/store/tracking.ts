// src/app/api/store/tracking.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select(`
      id,
      status,
      estimated_delivery,
      delivered_at,
      out_for_delivery_time,
      created_at
    `)
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order tracking:", error);
    return NextResponse.json({ error: "Failed to fetch order tracking" }, { status: 500 });
  }

  return NextResponse.json({ order: data });
}
