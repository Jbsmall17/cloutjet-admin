"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Users, CreditCard, Star, ShoppingCart, LogOut, X } from "lucide-react"
import { AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,AlertDialogTrigger } from "./ui/alert-dialog"
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog"

const navigation = [
  { name: "Accounts", href: "/dashboard/accounts", icon: Users },
  { name: "Escrow Transactions", href: "/dashboard/escrow", icon: CreditCard },
  { name: "Influencers", href: "/dashboard/influencers", icon: Star },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
]

interface AdminNavbarProps {
  pathname: string
  sidebarOpen: boolean
  onSidebarClose: () => void
}

export function AdminNavbar({ pathname, sidebarOpen, onSidebarClose }: AdminNavbarProps) {
  const router = useRouter()

  const handleLogout = () => {
    sessionStorage.removeItem("token")
    router.push("/")
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/50" onClick={onSidebarClose} />
        <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border">
          <div className="flex h-16 items-center justify-between px-4">
            <Image onClick={() => router.push("/dashboard")} src="/cloutjet-logo.svg" alt="Clout Jet" width={40} height={40} className="object-contain" />
            <Button variant="ghost" size="sm" onClick={onSidebarClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="px-4 py-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                    onClick={onSidebarClose}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="absolute left-4 bottom-4 w-full justify-start text-muted-foreground"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </Button>
            </AlertDialogTrigger> 
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will log you out of the admin dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Sign out</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card border-r border-border px-6">
          <div className="flex h-16 shrink-0 items-center">
            <Image onClick={() => router.push("/dashboard")} src="/cloutjet-logo.svg" alt="Clout Jet" width={40} height={40} className="object-contain cursor-pointer" />
            <span className="ml-3 text-lg font-semibold">Admin</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
          <div className="pb-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to sign out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will log you out of the admin dashboard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Sign out</AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </>
  )
}
