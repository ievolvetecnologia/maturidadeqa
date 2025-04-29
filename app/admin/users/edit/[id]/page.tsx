"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { UserForm } from "@/components/admin/user-form"
import { type User, getUserById, updateUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    // Carregar dados do usuário
    const userId = params.id as string
    const foundUser = getUserById(userId)

    if (foundUser) {
      setUser(foundUser)
    } else {
      toast({
        title: "Usuário não encontrado",
        description: "O usuário que você está tentando editar não foi encontrado.",
        variant: "destructive",
      })
      router.push("/admin/users")
    }

    setIsInitialLoading(false)
  }, [router, toast, params.id])

  const handleSubmit = async (userData: any) => {
    if (!user) return

    setIsLoading(true)

    try {
      updateUser(user.id, userData)

      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso.",
      })

      router.push("/admin/users")
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro ao atualizar o usuário.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/admin/users")
  }

  if (isInitialLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Carregando dados do usuário...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <h1 className="text-3xl font-bold gradient-heading">Editar Usuário</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <UserForm user={user} onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
        </motion.div>
      </div>
    </div>
  )
}
