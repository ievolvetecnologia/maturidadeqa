"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Home, LogOut, Shield, User, Users } from "lucide-react"
import { getCurrentUser, logout } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export function AdminHeader() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    setCurrentUser(getCurrentUser())
  }, [])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logout realizado",
      description: "Você saiu da área administrativa com sucesso.",
    })
    router.push("/admin/login")
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/admin/dashboard" className="font-bold text-xl flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white">
            <Shield className="h-4 w-4" />
          </div>
          <span className="gradient-heading font-extrabold">Admin SQM</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/admin/dashboard"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
          >
            <Users className="h-4 w-4" />
            Usuários
          </Link>
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Voltar ao Site
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/50 flex gap-2">
                <User className="h-4 w-4" />
                {currentUser?.name || "Administrador"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
