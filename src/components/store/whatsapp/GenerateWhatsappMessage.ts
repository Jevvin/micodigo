type WhatsAppMessageInput = {
  orderId: number;
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryType: "delivery" | "pickup";
  items: {
    name: string;
    quantity: number;
    price: number;
    extras?: {
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "cash" | "card";
  isPaid: boolean;
  cashReceived?: number;
};

export function generateWhatsappMessage(data: WhatsAppMessageInput): string {
  const now = new Date();
  const date = now.toLocaleDateString("es-MX");
  const time = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

  const itemsText = data.items
    .map((item) => {
      const extras = item.extras?.length
        ? "\n" +
          item.extras
            .map((e) => `  ➕ ${e.quantity} x ${e.name} ($${e.price})`)
            .join("\n")
        : "";
      return `X${item.quantity} ${item.name}${extras} - $${item.price}`;
    })
    .join("\n\n");

  const vuelto =
    data.paymentMethod === "cash" && data.cashReceived
      ? ` (monto recibido $${data.cashReceived}, vuelto $${(data.cashReceived - data.total).toFixed(2)})`
      : "";

  return `
👋 Vengo de https://${data.restaurantName.toLowerCase().replace(/\s/g, "")}.tuapp.com
MX-${data.orderId}
🗓️ ${date} ⏰ ${time}

Tipo de servicio: ${data.deliveryType === "pickup" ? "Para recoger" : "Domicilio"}

Nombre: ${data.customerName}
Teléfono: ${data.customerPhone}
Dirección: ${data.customerAddress || "No especificada"}

📝 Productos
${itemsText}

Subtotal: $${data.subtotal.toFixed(2)}
Entrega: $${data.deliveryFee.toFixed(2)}
Total: $${data.total.toFixed(2)}

💲 Pago
Estado del pago: ${data.isPaid ? "Pagado" : "No pagado"}
Total a pagar: $${data.total.toFixed(2)}
Forma de pago: ${data.paymentMethod === "cash" ? `Efectivo$${vuelto}` : "Tarjeta"}

👆 Envíanos este mensaje ahora. En cuanto lo recibamos estaremos atendiéndole.
  `.trim();
}
