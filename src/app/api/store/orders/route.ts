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

  // ✅ Validación fuerte
  if (!restaurantId || !customer || !items || items.length === 0 || !address) {
    return NextResponse.json({ error: "Invalid request - missing data" }, { status: 400 });
  }

  if (
    !customer.name ||
    !customer.phone ||
    !address.street ||
    !address.city ||
    !address.state
  ) {
    return NextResponse.json({ error: "Invalid request - missing fields" }, { status: 400 });
  }

  // 1️⃣ Insertar CUSTOMER
  let customerId = customer.id;
  if (!customerId) {
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert([{
        name: customer.name,
        email: customer.email,
        phone_number: customer.phone,
        restaurant_id: restaurantId
      }])
      .select()
      .single();

    if (customerError) {
      console.error("Error inserting customer:", customerError);
      return NextResponse.json({ error: "Customer insert failed" }, { status: 500 });
    }

    customerId = newCustomer.id;
  }

  // 2️⃣ Insertar CUSTOMER ADDRESS
  let addressId = address?.id;
  if (!addressId && address) {
    const { data: newAddress, error: addressError } = await supabase
      .from("customer_addresses")
      .insert([{
        customer_id: customerId,
        street: address.street,
        label: address.label,
        city: address.city,
        state: address.state,
        postal_code: address.postal_code,
        notes: address.notes
      }])
      .select()
      .single();

    if (addressError) {
      console.error("Error inserting address:", addressError);
      return NextResponse.json({ error: "Address insert failed" }, { status: 500 });
    }

    addressId = newAddress.id;
  }

  // 3️⃣ Insertar la ORDEN
  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert([{
      restaurant_id: restaurantId,
      customer_id: customerId,
      address_id: addressId,
      total_amount: total,
      payment_method: paymentMethod,
      delivery_type: deliveryType,
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

  // 4️⃣ Insertar ORDER ITEMS
  for (const item of items) {
    const { data: orderItem, error: itemError } = await supabase
      .from("order_items")
      .insert([{
        order_id: orderId,
        product_id: item.productId,
        product_name: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        price: item.price * item.quantity,
        notes: item.notes
      }])
      .select()
      .single();

    if (itemError) {
      console.error("Error inserting order item:", itemError);
      continue;
    }

    // 5️⃣ Insertar ORDER ITEM EXTRAS
    for (const extra of item.extras || []) {
      const { error: extraError } = await supabase
        .from("order_item_extras")
        .insert([{
          order_item_id: orderItem.id,
          extra_id: extra.id,
          extra_name: extra.name,
          unit_price: extra.price,
          quantity: extra.quantity,
          price: extra.price * extra.quantity
        }]);

      if (extraError) {
        console.error("Error inserting order item extra:", extraError);
      }
    }
  }

  return NextResponse.json({ success: true, orderId });
}
