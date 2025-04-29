export interface ActionPlan {
  id: string
  userId?: string
  userName?: string
  assessmentId?: string
  practiceId: string
  categoryName: string
  practiceName: string
  maturityScore: number
  title: string
  description: string
  responsible: string
  priority: "low" | "medium" | "high"
  dueDate?: string
  status: "todo" | "in-progress" | "done"
  createdAt: string
  updatedAt: string
}
