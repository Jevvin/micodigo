"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Order } from "@/types/pdv"

interface RejectOrderDialogProps {
  order: Order | null
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function RejectOrderDialog({
  order,
  open,
  onConfirm,
  onCancel,
}: RejectOrderDialogProps) {
  console.log("🔍 Order recibida en el dialog:", order); // ✅ aquí funciona

  
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Seguro que deseas cancelar este pedido?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 font-normal">
  Esta acción no se puede deshacer. El pedido <strong>ORDEN-{order?.id}</strong>
  {order?.customer?.name && (
    <> de <strong>{order.customer.name}</strong></>
  )} será rechazado permanentemente.
</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Sí, rechazar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
