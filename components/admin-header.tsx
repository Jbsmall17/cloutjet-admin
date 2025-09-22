"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

const navigation = [
  { name: "Accounts", href: "/dashboard/accounts" },
  { name: "Escrow Transactions", href: "/dashboard/escrow" },
  { name: "Influencers", href: "/dashboard/influencers" },
  { name: "Orders", href: "/dashboard/orders" },
]

interface AdminHeaderProps {
  pathname: string
  onMenuClick: () => void
}

export function AdminHeader({ pathname, onMenuClick }: AdminHeaderProps) {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-4 w-4" />
      </Button>
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <h1 className="text-lg font-semibold">
            {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
          </h1>
        </div>
      </div>
    </div>
  )
}
