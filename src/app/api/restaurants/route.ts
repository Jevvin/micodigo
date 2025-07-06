import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/utils/supabaseClient";
import { generateSlug } from "@/app/utils/generateSlug";

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Missing name" }, { status: 400 });
  }

  let baseSlug = generateSlug(name);
  let finalSlug = baseSlug;
  let counter = 1;

  while (true) {
    const { data, error } = await supabase
      .from("restaurants")
      .select("id")
      .eq("slug", finalSlug)
      .single();

    if (error && error.code === "PGRST116") break; // Not found
    if (!data) break;

    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  return NextResponse.json({ slug: finalSlug });
}
