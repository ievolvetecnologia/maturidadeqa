"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth"
import type { ActionPlan } from "@/lib/types"

interface ActionPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  practice: any
  onSave: (actionPlan: ActionPlan) => void
  existingPlan?: ActionPlan
}

export function ActionPlanDialog({ open, onOpenChange, practice, onSave, existingPlan }: ActionPlanDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [responsible, setResponsible] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo")

  useEffect(() => {
    if (existingPlan) {
      setTitle(existingPlan.title)
      setDescription(existingPlan.description)
      setResponsible(existingPlan.responsible)
      setPriority(existingPlan.priority)
      setDueDate(existingPlan.dueDate ? new Date(existingPlan.dueDate) : undefined)
      setStatus(existingPlan.status)
    } else if (practice) {
      // Set default title based on practice
      setTitle(`Melhorar ${practice.practiceName}`)
      setDescription(
        `Plano de ação para melhorar a maturidade da prática "${practice.practiceName}" que está atualmente em ${practice.maturityScore}%.`,
      )
      setResponsible("")
      setPriority("medium")
      setDueDate(undefined)
      setStatus("todo")
    }
  }, [practice, existingPlan, open])

  // Garantir que o ID da avaliação seja incluído no plano de ação

  const handleSave = () => {
    if (!title.trim()) {
      return // Don't save if title is empty
    }

    const currentUser = getCurrentUser()
    if (!currentUser) return

    const actionPlan: ActionPlan = {
      id: existingPlan?.id || `plan-${Date.now()}`,
      userId: existingPlan?.userId || currentUser.id,
      userName: existingPlan?.userName || currentUser.name,
      assessmentId: existingPlan?.assessmentId || "",
      practiceId: practice?.id || existingPlan?.practiceId || "",
      categoryName: practice?.categoryName || existingPlan?.categoryName || "",
      practiceName: practice?.practiceName || existingPlan?.practiceName || "",
      maturityScore: practice?.maturityScore || existingPlan?.maturityScore || 0,
      title,
      description,
      responsible,
      priority,
      dueDate: dueDate?.toISOString(),
      status,
      createdAt: existingPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onSave(actionPlan)
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setResponsible("")
    setPriority("medium")
    setDueDate(undefined)
    setStatus("todo")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="gradient-heading text-xl">
            {existingPlan ? "Editar Plano de Ação" : "Novo Plano de Ação"}
          </DialogTitle>
          <DialogDescription>
            {practice ? (
              <div className="mt-1">
                Para a prática <span className="font-medium">{practice.practiceName}</span> com maturidade atual de{" "}
                <span className="font-medium">{practice.maturityScore}%</span>
              </div>
            ) : (
              "Crie um plano de ação para melhorar a maturidade da prática."
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-primary/20 focus-visible:ring-primary/30"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] border-primary/20 focus-visible:ring-primary/30"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="responsible">Responsável</Label>
              <Input
                id="responsible"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="border-primary/20 focus-visible:ring-primary/30"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger className="border-primary/20 focus:ring-primary/30">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Data de Conclusão</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-primary/20 focus:ring-primary/30",
                      !dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger className="border-primary/20 focus:ring-primary/30">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">A Fazer</SelectItem>
                  <SelectItem value="in-progress">Em Andamento</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-primary hover:opacity-90 transition-opacity">
            {existingPlan ? "Atualizar" : "Criar"} Plano
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
