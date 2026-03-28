"use client"

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

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
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
    <aside className="flex h-screen w-72 flex-col border-r bg-card/40 backdrop-blur-xl">
      <div className="flex h-16 items-center px-5 border-b border-border/50">
        <PropVistaLogo size="sm" />
        <span className="ml-auto text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <nav className="flex flex-col gap-1">
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
                  "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-200",
                  isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"
                )} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-border/50 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-secondary/50 group">
              <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm group-hover:shadow-md transition-shadow">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start overflow-hidden text-left">
                <span className="w-full truncate text-sm font-semibold">
                  {user?.name || "Admin User"}
                </span>
                <span className="w-full truncate text-xs text-muted-foreground">
                  {user?.email || "admin@propvista.com"}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64" side="right" sideOffset={12}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
