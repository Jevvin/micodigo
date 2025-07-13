// src/app/api/store/restaurants.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("restaurants")
    .select(`
      id,
      name,
      description,
      address,
      phone,
      cover_image_url,
      logo_image_url,
      restaurant_hours(
        id,
        day_of_week,
        is_open,
        open_time,
        close_time
      )
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json({ error: "Failed to fetch restaurant" }, { status: 500 });
  }

  return NextResponse.json({ restaurant: data });
}
