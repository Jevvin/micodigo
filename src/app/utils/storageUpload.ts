import { supabase } from "@/app/utils/supabaseClient";

/**
 * Sube una imagen a Supabase Storage
 * @param restaurantId ID del restaurante
 * @param type "cover" o "profile"
 * @param file File a subir
 * @returns { success, url, error }
 */
export async function uploadImageToStorage(restaurantId: string, type: "cover" | "profile", file: File) {
  const filePath = `${restaurantId}/${type}/${file.name}`;

  // Subir al bucket "restaurants"
  const { error } = await supabase
    .storage
    .from('restaurants')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error al subir imagen:', error.message);
    return { success: false, error: error.message };
  }

  // Obtener URL pública
  const { data } = supabase
    .storage
    .from('restaurants')
    .getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    return { success: false, error: "No se pudo obtener URL pública" };
  }

  return { success: true, url: data.publicUrl };
}
