"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { isAuthenticated, isAdmin } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Não verificar autenticação na página de login
    if (pathname === "/admin/login") {
      setIsAuthorized(true)
      setIsLoading(false)
      return
    }

    // Verificar autenticação
    if (!isAuthenticated() || !isAdmin()) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar autenticado como administrador para acessar esta página.",
        variant: "destructive",
      })
      router.push("/admin/login")
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [pathname, router, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthorized && pathname !== "/admin/login") {
    return null
  }

  // Não mostrar o header na página de login
  if (pathname === "/admin/login") {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
