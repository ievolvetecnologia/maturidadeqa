"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Clock, Edit, MoreHorizontal, Trash2, User } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ActionPlan } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ActionPlanCardProps {
  plan: ActionPlan
  onEdit: () => void
  onDelete: () => void
}

export function ActionPlanCard({ plan, onEdit, onDelete }: ActionPlanCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500">Alta</Badge>
      case "medium":
        return <Badge className="bg-amber-500">Média</Badge>
      case "low":
        return <Badge className="bg-green-500">Baixa</Badge>
      default:
        return <Badge>Média</Badge>
    }
  }

  return (
    <>
      <Card className="border-primary/10 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-sm">{plan.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{plan.description}</p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="h-3 w-3" />
              {plan.responsible || "Não atribuído"}
            </div>
            {plan.dueDate && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(plan.dueDate), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              Atualizado em {format(new Date(plan.updatedAt), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">{plan.practiceName}</span> ({plan.maturityScore}%)
          </div>
          {getPriorityBadge(plan.priority)}
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plano de ação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este plano de ação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-500 hover:bg-red-600 text-white focus:ring-red-500">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
