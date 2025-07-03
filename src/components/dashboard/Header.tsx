"use client"

import Logo from "./Logo"
import Notifications from "./Notifications"
import UserMenu from "./UserMenu"

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b px-4 py-2 bg-background">
      <Logo />
      <div className="flex items-center gap-4">
        <Notifications />
        <UserMenu />
      </div>
    </header>
  )
}
