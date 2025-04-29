"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ActionPlanDialog } from "@/components/action-plan-dialog"
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

interface ActionPlanListProps {
  actionPlans: ActionPlan[]
  onUpdatePlan: (plan: ActionPlan) => void
  onDeletePlan: (planId: string) => void
}

export function ActionPlanList({ actionPlans, onUpdatePlan, onDeletePlan }: ActionPlanListProps) {
  const [editingPlan, setEditingPlan] = useState<ActionPlan | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleEditPlan = (plan: ActionPlan) => {
    setEditingPlan(plan)
    setIsDialogOpen(true)
  }

  const handleUpdatePlan = (updatedPlan: ActionPlan) => {
    onUpdatePlan(updatedPlan)
    setIsDialogOpen(false)
    setEditingPlan(null)
  }

  const handleDeleteClick = (planId: string) => {
    setDeletingPlanId(planId)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (deletingPlanId) {
      onDeletePlan(deletingPlanId)
      setShowDeleteDialog(false)
      setDeletingPlanId(null)
    }
  }

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "todo":
        return (
          <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
            A Fazer
          </Badge>
        )
      case "in-progress":
        return <Badge className="bg-blue-500">Em Andamento</Badge>
      case "done":
        return <Badge className="bg-green-500">Concluído</Badge>
      default:
        return <Badge>A Fazer</Badge>
    }
  }

  return (
    <>
      <Card className="border-primary/10 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle>Lista de Planos de Ação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-primary/10 overflow-hidden">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Prática</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Nenhum plano de ação criado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  actionPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{plan.practiceName}</span>
                          <span className="text-xs text-muted-foreground">{plan.categoryName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{plan.responsible || "-"}</TableCell>
                      <TableCell>
                        {plan.dueDate ? format(new Date(plan.dueDate), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                      </TableCell>
                      <TableCell>{getPriorityBadge(plan.priority)}</TableCell>
                      <TableCell>{getStatusBadge(plan.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                            className="h-8 w-8 p-0 border-primary/20"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(plan.id)}
                            className="h-8 w-8 p-0 border-primary/20 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingPlan && (
        <ActionPlanDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          practice={{
            id: editingPlan.practiceId,
            categoryName: editingPlan.categoryName,
            practiceName: editingPlan.practiceName,
            maturityScore: editingPlan.maturityScore,
          }}
          existingPlan={editingPlan}
          onSave={handleUpdatePlan}
        />
      )}

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
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
