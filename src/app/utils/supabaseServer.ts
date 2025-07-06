// src/app/utils/supabaseServer.ts

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export function createSupabaseServerClient() {
  return createServerComponentClient({
    cookies: () => cookies(),
  });
}
