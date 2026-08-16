"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  ArrowLeft,
  Users,
  Building2,
  Crown,
} from "lucide-react"
import { PropVistaLogo } from "@/components/propvista-logo"
import { useAdminAuth } from "@/lib/admin-auth"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const NAV_ITEMS = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/properties",
    label: "Properties",
    icon: Building2,
  },
  {
    href: "/admin/properties/new",
    label: "Add Property",
    icon: PlusCircle,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/subscribers",
    label: "Subscriptions",
    icon: Crown,
  },
  {
    href: "/admin/leads",
    label: "Interests & Leads",
    icon: LayoutDashboard,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAdminAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully", {
      description: "You have been logged out from admin panel and website."
    })
    router.push("/admin")
  }

  const initials = user?.name
    ? user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
    : "AD"

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-border/50 bg-card">
      {/* Logo */}
      <div className="flex h-[4.5rem] items-center px-6 border-b border-border/40">
        <PropVistaLogo size="sm" />
        <span className="ml-auto text-[9px] font-medium uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Admin</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/admin/properties" &&
                pathname.startsWith("/admin/properties") &&
                !pathname.includes("new"))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-4.5 w-4.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"
                )} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User section */}
      <div className="border-t border-border/40 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2.5 transition-all hover:bg-secondary/50 group">
              <Avatar className="h-9 w-9 border border-border/50">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start overflow-hidden text-left">
                <span className="w-full truncate text-sm font-medium">
                  {user?.name || "Admin User"}
                </span>
                <span className="w-full truncate text-xs text-muted-foreground">
                  {user?.email || "admin@propvista.com"}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" side="right" sideOffset={12}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                View Website
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout? You will be logged out from both the admin panel and the website.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  )
}
