"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActionPlanDialog } from "@/components/action-plan-dialog"
import { ActionPlanCard } from "@/components/action-plan-card"
import type { ActionPlan } from "@/lib/types"
import { DragDropContext, Droppable, Draggable, type DropResult } from "react-beautiful-dnd"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"

interface ActionPlanBoardProps {
  actionPlans: ActionPlan[]
  onUpdatePlan: (plan: ActionPlan) => void
  onDeletePlan: (planId: string) => void
}

export function ActionPlanBoard({ actionPlans, onUpdatePlan, onDeletePlan }: ActionPlanBoardProps) {
  const [editingPlan, setEditingPlan] = useState<ActionPlan | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const todoPlans = actionPlans.filter((plan) => plan.status === "todo")
  const inProgressPlans = actionPlans.filter((plan) => plan.status === "in-progress")
  const donePlans = actionPlans.filter((plan) => plan.status === "done")

  const handleEditPlan = (plan: ActionPlan) => {
    setEditingPlan(plan)
    setIsDialogOpen(true)
  }

  const handleUpdatePlan = (updatedPlan: ActionPlan) => {
    onUpdatePlan(updatedPlan)
    setIsDialogOpen(false)
    setEditingPlan(null)
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result

    // Dropped outside the list
    if (!destination) {
      return
    }

    // Find the plan that was dragged
    const planId = result.draggableId
    const plan = actionPlans.find((p) => p.id === planId)

    if (!plan) return

    // Map the destination droppableId to a status
    let newStatus: "todo" | "in-progress" | "done"
    switch (destination.droppableId) {
      case "todo":
        newStatus = "todo"
        break
      case "in-progress":
        newStatus = "in-progress"
        break
      case "done":
        newStatus = "done"
        break
      default:
        return
    }

    // If the status hasn't changed, do nothing
    if (plan.status === newStatus) {
      return
    }

    // Update the plan with the new status
    const updatedPlan = {
      ...plan,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }

    onUpdatePlan(updatedPlan)
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader className="pb-2 bg-slate-50 dark:bg-slate-900">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-slate-500" />
                  <CardTitle>A Fazer</CardTitle>
                </div>
                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800">
                  {todoPlans.length}
                </Badge>
              </div>
              <CardDescription>Planos de ação que ainda não foram iniciados</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Droppable droppableId="todo">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 min-h-[200px]">
                    {todoPlans.map((plan, index) => (
                      <Draggable key={plan.id} draggableId={plan.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <ActionPlanCard
                              plan={plan}
                              onEdit={() => handleEditPlan(plan)}
                              onDelete={() => onDeletePlan(plan.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* In Progress Column */}
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader className="pb-2 bg-blue-50 dark:bg-blue-950/30">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <CardTitle>Em Andamento</CardTitle>
                </div>
                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30">
                  {inProgressPlans.length}
                </Badge>
              </div>
              <CardDescription>Planos de ação que estão sendo executados</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Droppable droppableId="in-progress">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 min-h-[200px]">
                    {inProgressPlans.map((plan, index) => (
                      <Draggable key={plan.id} draggableId={plan.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <ActionPlanCard
                              plan={plan}
                              onEdit={() => handleEditPlan(plan)}
                              onDelete={() => onDeletePlan(plan.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>

          {/* Done Column */}
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader className="pb-2 bg-green-50 dark:bg-green-950/30">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <CardTitle>Concluído</CardTitle>
                </div>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30">
                  {donePlans.length}
                </Badge>
              </div>
              <CardDescription>Planos de ação que foram concluídos</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Droppable droppableId="done">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3 min-h-[200px]">
                    {donePlans.map((plan, index) => (
                      <Draggable key={plan.id} draggableId={plan.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <ActionPlanCard
                              plan={plan}
                              onEdit={() => handleEditPlan(plan)}
                              onDelete={() => onDeletePlan(plan.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        </div>
      </DragDropContext>

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
    </>
  )
}
