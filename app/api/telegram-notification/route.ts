import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { orderNumber, customerName, email, total, paymentMethod, shippingMethod } = await request.json()

    // Verificar que los datos necesarios estén presentes
    if (!orderNumber || !email || total === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos incompletos para enviar la notificación",
        },
        { status: 400 },
      )
    }

    // Crear el mensaje para Telegram
    const message = `
🛍️ *NUEVO PEDIDO #${orderNumber}*

👤 *Cliente:* ${customerName || "No especificado"}
📧 *Email:* ${email}
💰 *Total:* $${total.toLocaleString()}
💳 *Método de pago:* ${paymentMethod === "transferencia" ? "Transferencia bancaria" : "Efectivo"}
🚚 *Método de envío:* ${shippingMethod === "delivery" ? "Envío a domicilio" : "Retiro en tienda"}

[Ver detalles en el panel de administración]
    `

    // En el entorno de vista previa, simulamos el envío de la notificación
    console.log("Simulando envío de notificación a Telegram:")
    console.log(message)

    return NextResponse.json({ success: true, preview: true })
  } catch (error) {
    console.error("Error al enviar notificación a Telegram:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al enviar notificación",
      },
      { status: 500 },
    )
  }
}
