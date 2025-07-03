"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Notifications() {
  return (
    <Button variant="ghost" size="icon" aria-label="Notificaciones">
      <Bell className="h-5 w-5" />
      <span className="sr-only">Ver notificaciones</span>
    </Button>
  )
}
