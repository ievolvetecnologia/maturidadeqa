"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

export default function ContactForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [formError, setFormError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setFormError(null) // Limpar erro quando o usuário digita
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      setFormError("Por favor, preencha todos os campos do formulário.")
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos do formulário.",
        variant: "destructive",
      })
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormError("Por favor, insira um endereço de email válido.")
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Enviando formulário:", formData)

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("Resposta da API:", data)

      if (response.ok && data.success) {
        toast({
          title: "Solicitação enviada!",
          description: "Um consultor entrará em contato com você em breve.",
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
        })
      } else {
        throw new Error(data.message || "Ocorreu um erro ao enviar o formulário.")
      }
    } catch (error: any) {
      console.error("Erro no formulário:", error)
      setFormError(error.message || "Ocorreu um erro ao enviar o formulário. Tente novamente mais tarde.")
      toast({
        title: "Erro ao enviar",
        description: error.message || "Ocorreu um erro ao enviar o formulário. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-md text-sm">{formError}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-white">
          Nome completo
        </Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Digite seu nome completo"
          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/30"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/30"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white">
          Telefone de contato
        </Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(00) 00000-0000"
          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/30"
          required
        />
      </div>

      <Button type="submit" className="w-full bg-white text-primary hover:bg-white/90 mt-6" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Enviando...
          </>
        ) : (
          <>
            Falar com consultor
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
