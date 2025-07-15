import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { getOrdersByRestaurant } from "@/app/utils/supabasePdv"
import { Order } from "@/types/pdv"
import PDVClient from "@/components/dashboard/pdv/PDVClient"

export const dynamic = "force-dynamic"

export default async function PDVPage() {
  const supabase = createServerComponentClient({ cookies })

  // ✅ 1️⃣ Verificar usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.log("❌ No hay usuario autenticado")
    return <p className="p-4">Debes iniciar sesión para ver esta página.</p>
  }

  // ✅ 2️⃣ Obtener el restaurante del usuario
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (error || !restaurant) {
    console.error("❌ Error al obtener restaurante:", error)
    return <p className="p-4">Error: No se encontró restaurante asociado a tu cuenta.</p>
  }

  const restaurantId = restaurant.id
  console.log("🟢 Restaurant ID encontrado:", restaurantId)

  // ✅ 3️⃣ Obtener pedidos reales
  let orders: Order[] = []
  try {
    orders = await getOrdersByRestaurant(restaurantId.toString())
    console.log("🟡 Pedidos obtenidos del server:", orders)
  } catch (err) {
    console.error("❌ Error al obtener pedidos:", err)
  }

  // ✅ 4️⃣ Renderizar Client Component con los datos
  return (
    <div className="p-4">
      <PDVClient orders={orders} />
    </div>
  )
}
