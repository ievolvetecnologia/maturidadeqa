"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingDown, TrendingUp, Minus, CheckCircle2, ClipboardList } from "lucide-react"
import { questionData } from "@/lib/question-data"
import { ComparisonChart } from "@/components/comparison-chart"
import type { ActionPlan } from "@/lib/types"

interface Assessment {
  id: string
  squadName: string
  answers: Record<string, number>
  date: string
}

interface ComparisonViewProps {
  baseAssessmentId: string
  compareAssessmentId: string
  assessments: Assessment[]
  actionPlans: ActionPlan[]
}

export function ComparisonView({
  baseAssessmentId,
  compareAssessmentId,
  assessments,
  actionPlans,
}: ComparisonViewProps) {
  const [baseAssessment, setBaseAssessment] = useState<Assessment | null>(null)
  const [compareAssessment, setCompareAssessment] = useState<Assessment | null>(null)
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [overallChange, setOverallChange] = useState<number>(0)
  const [selectedCategory, setSelectedCategory] = useState<string>(questionData[0]?.id || "")

  useEffect(() => {
    const base = assessments.find((a) => a.id === baseAssessmentId) || null
    const compare = assessments.find((a) => a.id === compareAssessmentId) || null

    setBaseAssessment(base)
    setCompareAssessment(compare)

    if (base && compare) {
      generateComparisonData(base, compare)
    }
  }, [baseAssessmentId, compareAssessmentId, assessments])

  const generateComparisonData = (base: Assessment, compare: Assessment) => {
    const data: any[] = []
    let totalBasePractices = 0
    let totalBaseScore = 0
    let totalCompareScore = 0

    questionData.forEach((category) => {
      const categoryData: any = {
        id: category.id,
        name: category.name,
        practices: [],
      }

      category.practices.forEach((practice) => {
        // Calculate average for this practice in both assessments
        let baseTotal = 0
        let baseCount = 0
        let compareTotal = 0
        let compareCount = 0

        practice.questions.forEach((question) => {
          const questionId = `${category.id}-${practice.id}-${question.id}`

          if (base.answers[questionId] !== undefined) {
            baseTotal += base.answers[questionId]
            baseCount++
          }

          if (compare.answers[questionId] !== undefined) {
            compareTotal += compare.answers[questionId]
            compareCount++
          }
        })

        const baseAverage = baseCount > 0 ? Math.round(baseTotal / baseCount) : 0
        const compareAverage = compareCount > 0 ? Math.round(compareTotal / compareCount) : 0
        const difference = compareAverage - baseAverage

        // Find related action plans
        const relatedPlans = actionPlans.filter((plan) => plan.practiceId === `${category.id}-${practice.id}`)

        // Check if any of the related plans are completed
        const hasCompletedPlans = relatedPlans.some((plan) => plan.status === "done")

        categoryData.practices.push({
          id: practice.id,
          name: practice.name,
          baseScore: baseAverage,
          compareScore: compareAverage,
          difference,
          relatedPlans,
          hasCompletedPlans,
        })

        totalBasePractices++
        totalBaseScore += baseAverage
        totalCompareScore += compareAverage
      })

      data.push(categoryData)
    })

    setComparisonData(data)

    // Calculate overall change
    const baseOverall = totalBaseScore / totalBasePractices
    const compareOverall = totalCompareScore / totalBasePractices
    setOverallChange(Math.round(compareOverall - baseOverall))
  }

  const getChangeIndicator = (difference: number) => {
    if (difference > 0) {
      return <TrendingUp className="h-5 w-5 text-green-500" />
    } else if (difference < 0) {
      return <TrendingDown className="h-5 w-5 text-red-500" />
    } else {
      return <Minus className="h-5 w-5 text-gray-500" />
    }
  }

  const getChangeBadge = (difference: number) => {
    if (difference > 10) {
      return <Badge className="bg-green-500">Melhoria Significativa</Badge>
    } else if (difference > 0) {
      return <Badge className="bg-emerald-400">Melhoria</Badge>
    } else if (difference < -10) {
      return <Badge className="bg-red-500">Queda Significativa</Badge>
    } else if (difference < 0) {
      return <Badge className="bg-red-400">Queda</Badge>
    } else {
      return <Badge variant="outline">Sem Alteração</Badge>
    }
  }

  if (!baseAssessment || !compareAssessment) {
    return null
  }

  return (
    <Card className="border-primary/10 shadow-lg shadow-primary/5">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Comparativo de Avaliações</CardTitle>
            <CardDescription>
              Comparando {baseAssessment.squadName} ({new Date(baseAssessment.date).toLocaleDateString()}) com{" "}
              {compareAssessment.squadName} ({new Date(compareAssessment.date).toLocaleDateString()})
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getChangeIndicator(overallChange)}
            <div className="text-lg font-semibold">
              {overallChange > 0 ? "+" : ""}
              {overallChange}%
            </div>
            {getChangeBadge(overallChange)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Evolução Geral por Categoria</h3>
          <div className="h-80">
            <ComparisonChart
              data={comparisonData.map((category) => ({
                name: category.name,
                baseValue:
                  category.practices.reduce((sum: number, p: any) => sum + p.baseScore, 0) / category.practices.length,
                compareValue:
                  category.practices.reduce((sum: number, p: any) => sum + p.compareScore, 0) /
                  category.practices.length,
              }))}
            />
          </div>
        </div>

        <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="mb-4 flex flex-wrap bg-primary/5 p-1">
            {questionData.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {comparisonData.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="space-y-6">
                {category.practices.map((practice: any) => (
                  <div
                    key={practice.id}
                    className="border border-primary/10 rounded-lg p-4 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                      <div className="flex items-center gap-2">
                        {getChangeIndicator(practice.difference)}
                        <h3 className="font-medium text-lg">
                          {practice.id}. {practice.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">
                          {practice.difference > 0 ? "+" : ""}
                          {practice.difference}%
                        </div>
                        {getChangeBadge(practice.difference)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Avaliação Anterior</span>
                          <span className="text-sm font-medium">{practice.baseScore}%</span>
                        </div>
                        <Progress value={practice.baseScore} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Avaliação Atual</span>
                          <span className="text-sm font-medium">{practice.compareScore}%</span>
                        </div>
                        <Progress
                          value={practice.compareScore}
                          className="h-2"
                          indicatorClassName={
                            practice.difference > 0 ? "bg-green-500" : practice.difference < 0 ? "bg-red-500" : ""
                          }
                        />
                      </div>
                    </div>

                    {practice.relatedPlans.length > 0 && (
                      <div className="mt-4 border-t border-primary/10 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ClipboardList className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">Planos de Ação Relacionados</h4>
                        </div>
                        <div className="space-y-2">
                          {practice.relatedPlans.map((plan: ActionPlan) => (
                            <div
                              key={plan.id}
                              className="flex items-center justify-between bg-primary/5 p-2 rounded-md"
                            >
                              <div className="flex items-center gap-2">
                                {plan.status === "done" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                <span
                                  className={plan.status === "done" ? "text-sm line-through opacity-70" : "text-sm"}
                                >
                                  {plan.title}
                                </span>
                              </div>
                              <Badge
                                className={
                                  plan.status === "todo"
                                    ? "bg-slate-500"
                                    : plan.status === "in-progress"
                                      ? "bg-blue-500"
                                      : "bg-green-500"
                                }
                              >
                                {plan.status === "todo"
                                  ? "A Fazer"
                                  : plan.status === "in-progress"
                                    ? "Em Andamento"
                                    : "Concluído"}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        {practice.difference > 0 && practice.hasCompletedPlans && (
                          <div className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Os planos de ação concluídos contribuíram para a melhoria desta prática.</span>
                          </div>
                        )}

                        {practice.difference <= 0 && practice.hasCompletedPlans && (
                          <div className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>
                              Apesar dos planos de ação concluídos, não houve melhoria significativa nesta prática.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
