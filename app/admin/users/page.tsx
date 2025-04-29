"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Search, UserPlus } from "lucide-react"
import { UserTable } from "@/components/admin/user-table"
import { type User, deleteUser, getAllUsers } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Carregar usuários
    try {
      const allUsers = getAllUsers()
      setUsers(allUsers)
      setFilteredUsers(allUsers)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
      toast({
        title: "Erro ao carregar usuários",
        description: "Ocorreu um erro ao carregar a lista de usuários.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    // Filtrar usuários quando a busca mudar
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const handleEditUser = (user: User) => {
    router.push(`/admin/users/edit/${user.id}`)
  }

  const handleDeleteUser = (userId: string) => {
    try {
      deleteUser(userId)

      // Atualizar lista de usuários
      const updatedUsers = users.map((user) => {
        if (user.id === userId) {
          return { ...user, active: false }
        }
        return user
      })

      setUsers(updatedUsers)
      setFilteredUsers(
        updatedUsers.filter((user) => {
          if (searchQuery.trim() === "") return true
          const query = searchQuery.toLowerCase()
          return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
        }),
      )

      toast({
        title: "Usuário desativado",
        description: "O usuário foi desativado com sucesso.",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao desativar usuário",
        description: error.message || "Ocorreu um erro ao desativar o usuário.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-heading">Gerenciamento de Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie os usuários do sistema, incluindo administradores e usuários comuns.
            </p>
          </div>

          <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity">
            <Link href="/admin/users/new">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-primary/10 shadow-lg shadow-primary/5 mb-8">
            <CardHeader className="pb-2">
              <CardTitle>Usuários</CardTitle>
              <CardDescription>Lista de todos os usuários cadastrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-primary/20 focus-visible:ring-primary/30"
                  />
                </div>
              </div>

              <UserTable
                users={filteredUsers.filter((user) => user.active)}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
