// src/app/api/store/orders.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await req.json();

  const {
    restaurantId,
    customer,
    items,
    total,
    paymentMethod,
    deliveryType,
    address,
    specialInstructions
  } = body;

  if (!restaurantId || !customer || !items || items.length === 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // 1️⃣ Insertar/obtener customer
  let customerId = customer.id;
  if (!customerId) {
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert([{
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }])
      .select()
      .single();

    if (customerError) {
      console.error("Error inserting customer:", customerError);
      return NextResponse.json({ error: "Customer insert failed" }, { status: 500 });
    }
    customerId = newCustomer.id;
  }

  // 2️⃣ Insertar la orden
  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert([{
      restaurant_id: restaurantId,
      customer_id: customerId,
      total,
      payment_method: paymentMethod,
      delivery_type: deliveryType,
      address,
      special_instructions: specialInstructions,
      status: "new"
    }])
    .select()
    .single();

  if (orderError) {
    console.error("Error inserting order:", orderError);
    return NextResponse.json({ error: "Order insert failed" }, { status: 500 });
  }

  const orderId = newOrder.id;

  // 3️⃣ Insertar los items
  for (const item of items) {
    const { data: orderItem, error: itemError } = await supabase
      .from("order_items")
      .insert([{
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        notes: item.notes
      }])
      .select()
      .single();

    if (itemError) {
      console.error("Error inserting order item:", itemError);
      continue;
    }

    // 4️⃣ Insertar extras del item
    for (const extra of item.extras || []) {
      const { error: extraError } = await supabase
        .from("order_item_extras")
        .insert([{
          order_item_id: orderItem.id,
          extra_id: extra.extraId,
          quantity: extra.quantity
        }]);

      if (extraError) {
        console.error("Error inserting order item extra:", extraError);
      }
    }
  }

  return NextResponse.json({ success: true, orderId });
}
