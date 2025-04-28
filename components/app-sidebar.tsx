"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FileText,
  FileSpreadsheet,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  BarChart3,
  Library,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-status"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Quotes",
    href: "/quotes",
    icon: FileSpreadsheet,
  },
  {
    title: "Library",
    href: "/library",
    icon: Library,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-border/30">
        <div className="flex items-center p-4">
          <Link href="/">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-full bg-primary"></div>
              <AnimatePresence>
                {state === "expanded" && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="font-bold text-lg text-primary-foreground overflow-hidden whitespace-nowrap"
                  >
                    BuildLedger
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                  <Link
                    href={item.href}
                    className="flex items-center transition-colors duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  >
                    <item.icon className={isActive ? "text-primary" : ""} />
                    <span>{item.title}</span>
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute left-0 w-1 h-full bg-primary rounded-r-md"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/30 p-4">
        <div className="flex flex-col gap-2">
          <UserAuthMenu />
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function UserAuthMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 w-full justify-start px-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/auth/login")}>
        <LogIn className="mr-2 h-4 w-4" />
        <span>Sign In</span>
      </Button>
      <Button variant="default" className="w-full justify-start" onClick={() => router.push("/auth/signup")}>
        <UserPlus className="mr-2 h-4 w-4" />
        <span>Sign Up</span>
      </Button>
    </div>
  )
}
