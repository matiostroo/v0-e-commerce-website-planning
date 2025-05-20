"use client"

import { useCart } from "@/context/cart-context"
import { CartNotification } from "@/components/cart-notification"

export function CartNotificationWrapper() {
  const { lastAddedItem, showNotification, closeNotification } = useCart()

  return <CartNotification show={showNotification} product={lastAddedItem} onClose={closeNotification} />
}
