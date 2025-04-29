"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { UserForm } from "@/components/admin/user-form"
import { addUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

export default function NewUserPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (userData: any) => {
    setIsLoading(true)

    try {
      addUser(userData)

      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso.",
      })

      router.push("/admin/users")
    } catch (error: any) {
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/admin/users")
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
          <h1 className="text-3xl font-bold gradient-heading">Novo Usuário</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <UserForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
        </motion.div>
      </div>
    </div>
  )
}
