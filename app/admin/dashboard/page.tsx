"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Users } from "lucide-react"
import { getAllUsers, getCurrentUser } from "@/lib/auth"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
  })

  useEffect(() => {
    // Carregar estatísticas
    const loadStats = () => {
      try {
        const users = getAllUsers()

        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.active).length,
          adminUsers: users.filter((u) => u.role === "admin" && u.active).length,
          regularUsers: users.filter((u) => u.role === "user" && u.active).length,
        })
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error)
      }
    }

    loadStats()
  }, [])

  const currentUser = getCurrentUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-heading">Dashboard Administrativo</h1>
              <p className="text-muted-foreground">
                Bem-vindo, <span className="font-medium">{currentUser?.name || "Administrador"}</span>
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-primary/10 shadow-lg shadow-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-primary/10 shadow-lg shadow-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Usuários Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeUsers}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-primary/10 shadow-lg shadow-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Administradores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.adminUsers}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-primary/10 shadow-lg shadow-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Usuários Regulares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.regularUsers}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>Gerencie os usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-muted-foreground">
                  Gerencie os usuários do sistema, incluindo administradores e usuários comuns.
                </p>
                <div className="flex gap-4">
                  <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity">
                    <Link href="/admin/users">
                      <Users className="h-4 w-4 mr-2" />
                      Gerenciar Usuários
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="border-primary/20 hover:border-primary/50">
                    <Link href="/admin/users/new">Adicionar Novo Usuário</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
