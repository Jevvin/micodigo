"use client"

import { User } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UserMenu() {
  return (
    <Button variant="ghost" size="icon" aria-label="Usuario">
      <User className="h-5 w-5" />
      <span className="sr-only">Abrir menú de usuario</span>
    </Button>
  )
}
