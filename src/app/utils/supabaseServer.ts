import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Next 14 cookies() compatibility shim.
 * Emula la interfaz CookieStore para Supabase.
 */
async function getCookiesAdapter() {
  const cookieList = await cookies().getAll();

  return {
    get(name: string) {
      return cookieList.find((c) => c.name === name);
    },
  };
}

export async function createSupabaseServerClient() {
  return createServerComponentClient({
    cookies: getCookiesAdapter,
  });
}
