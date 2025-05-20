import { NextResponse } from "next/server"

// Inicializar Resend con la API key
const resendApiKey = process.env.RESEND_API_KEY

export async function POST(request: Request) {
  try {
    const { email, orderNumber, items, total, paymentMethod } = await request.json()

    // Verificar que los datos necesarios estén presentes
    if (!email || !orderNumber || !items || total === undefined) {
      console.error("Datos incompletos:", { email, orderNumber, itemsLength: items?.length, total })
      return NextResponse.json(
        {
          success: false,
          error: "Datos incompletos para enviar el correo",
        },
        { status: 400 },
      )
    }

    // Crear el contenido del correo en formato HTML
    let itemsHtml = ""
    items.forEach((item) => {
      itemsHtml += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">
            ${item.name} - ${item.color}, Talle ${item.size}
          </td>
          <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">
            ${item.quantity}
          </td>
          <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">
            ${(item.price * item.quantity).toLocaleString()}
          </td>
        </tr>
      `
    })

    // Mensaje específico según el método de pago
    const paymentMessage =
      paymentMethod === "transferencia"
        ? "Has seleccionado pago por transferencia bancaria. Confirmaremos tu pedido una vez recibido el pago."
        : "Has seleccionado pago en efectivo. Un agente se contactará contigo por WhatsApp para coordinar la entrega o retiro del producto."

    // Contenido HTML del correo
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000; text-align: center;">¡Gracias por tu compra!</h1>
        <p>Hola,</p>
        <p>Hemos recibido tu pedido correctamente. A continuación, te enviamos los detalles:</p>
        
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Pedido #${orderNumber}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Producto</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Cantidad</th>
              <th style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">Precio</th>
            </tr>
            ${itemsHtml}
            <tr>
              <td colspan="2" style="text-align: right; padding: 8px; font-weight: bold;">Total:</td>
              <td style="text-align: right; padding: 8px; font-weight: bold;">${total.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #000;">
          <p style="margin: 0;"><strong>Estado del pedido:</strong> Tu pedido fue procesado.</p>
          <p style="margin-top: 10px;">${paymentMessage}</p>
        </div>
        
        <p>Nos pondremos en contacto contigo a través de WhatsApp para coordinar los siguientes pasos.</p>
        
        <p>Si tienes alguna pregunta, no dudes en contactarnos:</p>
        <ul>
          <li>WhatsApp: +54 9 11 5053 5668</li>
          <li>Email: info@galazzia.com.ar</li>
        </ul>
        
        <p style="text-align: center; margin-top: 30px; color: #777; font-size: 12px;">
          © 2025 Galazzia. Todos los derechos reservados.
        </p>
      </div>
    `

    // En el entorno de vista previa, simulamos el envío de correo
    console.log("Simulando envío de correo a:", email)
    console.log("Contenido del correo:", htmlContent)

    // Intentar enviar notificación a Telegram (también simulado en vista previa)
    await sendTelegramNotification(orderNumber, email, total, paymentMethod)

    return NextResponse.json({ success: true, preview: true })
  } catch (error) {
    console.error("Error al enviar correo:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al enviar correo",
      },
      { status: 500 },
    )
  }
}

// Función para enviar notificación a Telegram (simulada en vista previa)
async function sendTelegramNotification(orderNumber: string, email: string, total: number, paymentMethod: string) {
  try {
    console.log("Simulando envío de notificación a Telegram:")
    console.log(`
🛍️ NUEVO PEDIDO #${orderNumber}

👤 Cliente: ${email}
💰 Total: ${total.toLocaleString()}
💳 Método de pago: ${paymentMethod === "transferencia" ? "Transferencia bancaria" : "Efectivo"}

[Ver detalles en el panel de administración]
    `)
  } catch (error) {
    console.error("Error al enviar notificación a Telegram:", error)
  }
}
