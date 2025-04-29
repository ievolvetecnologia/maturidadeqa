"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/auth"

interface UserFormProps {
  user?: User
  onSubmit: (userData: any) => void
  onCancel: () => void
  isLoading: boolean
}

export function UserForm({ user, onSubmit, onCancel, isLoading }: UserFormProps) {
  const { toast } = useToast()
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"admin" | "user">(user?.role || "user")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido.",
        variant: "destructive",
      })
      return
    }

    // Validar senha para novos usuários
    if (!user) {
      if (!password) {
        toast({
          title: "Senha obrigatória",
          description: "A senha é obrigatória para novos usuários.",
          variant: "destructive",
        })
        return
      }

      if (password.length < 6) {
        toast({
          title: "Senha muito curta",
          description: "A senha deve ter pelo menos 6 caracteres.",
          variant: "destructive",
        })
        return
      }

      if (password !== confirmPassword) {
        toast({
          title: "Senhas não conferem",
          description: "A senha e a confirmação de senha devem ser iguais.",
          variant: "destructive",
        })
        return
      }
    }

    // Preparar dados do usuário
    const userData = {
      name,
      email,
      role,
      active: true,
      ...(password ? { password } : {}),
    }

    onSubmit(userData)
  }

  return (
    <Card className="border-primary/10 shadow-lg shadow-primary/5">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{user ? "Editar Usuário" : "Novo Usuário"}</CardTitle>
          <CardDescription>
            {user ? "Edite as informações do usuário existente" : "Preencha os campos para criar um novo usuário"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              className="border-primary/20 focus-visible:ring-primary/30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="border-primary/20 focus-visible:ring-primary/30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select value={role} onValueChange={(value: "admin" | "user") => setRole(value)}>
              <SelectTrigger className="border-primary/20 focus:ring-primary/30">
                <SelectValue placeholder="Selecione a função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{user ? "Nova Senha (deixe em branco para manter a atual)" : "Senha"}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={user ? "••••••••" : "Digite a senha"}
              className="border-primary/20 focus-visible:ring-primary/30"
              required={!user}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{user ? "Confirmar Nova Senha" : "Confirmar Senha"}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a senha"
              className="border-primary/20 focus-visible:ring-primary/30"
              required={!user}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-primary/20 hover:border-primary/50"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {user ? "Atualizando..." : "Criando..."}
              </>
            ) : user ? (
              "Atualizar Usuário"
            ) : (
              "Criar Usuário"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
