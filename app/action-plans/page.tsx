"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Filter } from "lucide-react"
import { motion } from "framer-motion"
import { questionData } from "@/lib/question-data"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ActionPlanDialog } from "@/components/action-plan-dialog"
import { ActionPlanBoard } from "@/components/action-plan-board"
import { ActionPlanList } from "@/components/action-plan-list"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ActionPlan } from "@/lib/types"

interface Assessment {
  id: string
  userId: string
  userName: string
  squadName: string
  valueStream?: string
  answers: Record<string, number>
  observations?: Record<string, string>
  date: string
}

export default function ActionPlansPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("id")
  const { toast } = useToast()

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [lowMaturityPractices, setLowMaturityPractices] = useState<any[]>([])
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([])
  const [filteredActionPlans, setFilteredActionPlans] = useState<ActionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPractice, setSelectedPractice] = useState<any>(null)
  const [view, setView] = useState<"list" | "board">("board")

  // Filtros
  const [squadFilter, setSquadFilter] = useState<string>("all")
  const [valueStreamFilter, setValueStreamFilter] = useState<string>("all")
  const [availableSquads, setAvailableSquads] = useState<string[]>([])
  const [availableValueStreams, setAvailableValueStreams] = useState<string[]>([])

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa fazer login para acessar esta página.",
        variant: "destructive",
      })
      router.push("/login?redirect=/action-plans")
      return
    }

    setIsInitializing(false)
  }, [router, toast])

  useEffect(() => {
    if (isInitializing) return

    // Load assessment data
    const loadAssessments = () => {
      const currentUser = getCurrentUser()
      if (!currentUser) return []

      const savedAssessments = JSON.parse(localStorage.getItem("sqm-assessments") || "[]")
      return savedAssessments.filter((a: Assessment) => a.userId === currentUser.id)
    }

    // Load action plans
    const loadActionPlans = () => {
      const currentUser = getCurrentUser()
      if (!currentUser) return []

      const savedPlans = localStorage.getItem("sqm-action-plans")
      if (savedPlans) {
        const allPlans = JSON.parse(savedPlans)
        const userPlans = allPlans.filter((plan: ActionPlan) => plan.userId === currentUser.id)
        console.log("Planos de ação carregados:", userPlans)
        return userPlans
      }
      return []
    }

    // Find practices with maturity below 70%
    const findLowMaturityPractices = (assessment: Assessment) => {
      if (!assessment) return []

      const lowMaturityItems: any[] = []

      questionData.forEach((category) => {
        category.practices.forEach((practice) => {
          // Calculate average for this practice
          let total = 0
          let count = 0

          practice.questions.forEach((question) => {
            const questionId = `${category.id}-${practice.id}-${question.id}`
            if (assessment.answers[questionId] !== undefined) {
              total += assessment.answers[questionId]
              count++
            }
          })

          const average = count > 0 ? Math.round(total / count) : 0

          // If below 70%, add to low maturity items
          if (average < 70) {
            lowMaturityItems.push({
              id: `${category.id}-${practice.id}`,
              categoryId: category.id,
              categoryName: category.name,
              practiceId: practice.id,
              practiceName: practice.name,
              maturityScore: average,
              questions: practice.questions.map((q) => ({
                id: q.id,
                text: q.text,
                score: assessment.answers[`${category.id}-${practice.id}-${q.id}`] || 0,
              })),
            })
          }
        })
      })

      return lowMaturityItems
    }

    const init = async () => {
      setIsLoading(true)

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const loadedAssessments = loadAssessments()
        setAssessments(loadedAssessments)

        // Extract unique squads and value streams
        const squads = Array.from(new Set(loadedAssessments.map((a) => a.squadName)))
        const valueStreams = Array.from(new Set(loadedAssessments.map((a) => a.valueStream).filter(Boolean)))

        setAvailableSquads(squads)
        setAvailableValueStreams(valueStreams)

        // Set selected assessment
        let selectedAssessment = null
        if (assessmentId) {
          selectedAssessment = loadedAssessments.find((a) => a.id === assessmentId)
        } else if (loadedAssessments.length > 0) {
          // Use the most recent assessment
          selectedAssessment = loadedAssessments.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )[0]
        }

        if (selectedAssessment) {
          setAssessment(selectedAssessment)
          const lowMaturityItems = findLowMaturityPractices(selectedAssessment)
          setLowMaturityPractices(lowMaturityItems)
        }

        const loadedPlans = loadActionPlans()
        setActionPlans(loadedPlans)
        setFilteredActionPlans(loadedPlans)
      } catch (error) {
        console.error("Error initializing action plans:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os planos de ação.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [assessmentId, toast, isInitializing])

  // Filtrar planos de ação quando os filtros mudarem
  useEffect(() => {
    if (!actionPlans.length) return

    // Simplificar a lógica de filtragem para garantir que os planos sejam exibidos
    let filtered = [...actionPlans]

    // Aplicar filtro de Squad apenas se não for "all"
    if (squadFilter !== "all") {
      filtered = filtered.filter((plan) => {
        const relatedAssessment = assessments.find((a) => a.id === plan.assessmentId)
        return relatedAssessment?.squadName === squadFilter
      })
    }

    // Aplicar filtro de Value Stream apenas se não for "all"
    if (valueStreamFilter !== "all") {
      filtered = filtered.filter((plan) => {
        const relatedAssessment = assessments.find((a) => a.id === plan.assessmentId)
        return relatedAssessment?.valueStream === valueStreamFilter
      })
    }

    setFilteredActionPlans(filtered)
  }, [squadFilter, valueStreamFilter, actionPlans, assessments])

  const handleCreateActionPlan = (practice: any) => {
    setSelectedPractice(practice)
    setIsDialogOpen(true)
  }

  // Corrigir a função saveActionPlan para garantir que os planos sejam salvos corretamente

  const saveActionPlan = (actionPlan: ActionPlan) => {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    // Adicionar ID do usuário e da avaliação ao plano de ação
    const planWithUser = {
      ...actionPlan,
      userId: currentUser.id,
      userName: currentUser.name,
      assessmentId: assessment?.id || "",
    }

    // Carregar todos os planos existentes
    const allPlans = JSON.parse(localStorage.getItem("sqm-action-plans") || "[]")

    // Verificar se é uma atualização ou um novo plano
    const isUpdate = allPlans.some((p: ActionPlan) => p.id === planWithUser.id)

    let updatedAllPlans
    if (isUpdate) {
      updatedAllPlans = allPlans.map((p: ActionPlan) => (p.id === planWithUser.id ? planWithUser : p))
    } else {
      updatedAllPlans = [...allPlans, planWithUser]
    }

    // Atualizar apenas os planos do usuário atual na interface
    let updatedUserPlans
    if (isUpdate) {
      updatedUserPlans = actionPlans.map((p) => (p.id === planWithUser.id ? planWithUser : p))
    } else {
      updatedUserPlans = [...actionPlans, planWithUser]
    }

    setActionPlans(updatedUserPlans)

    // Aplicar os mesmos filtros para manter a consistência
    let filtered = [...updatedUserPlans]

    if (squadFilter !== "all") {
      filtered = filtered.filter((plan) => {
        const relatedAssessment = assessments.find((a) => a.id === plan.assessmentId)
        return relatedAssessment?.squadName === squadFilter
      })
    }

    if (valueStreamFilter !== "all") {
      filtered = filtered.filter((plan) => {
        const relatedAssessment = assessments.find((a) => a.id === plan.assessmentId)
        return relatedAssessment?.valueStream === valueStreamFilter
      })
    }

    setFilteredActionPlans(filtered)

    // Salvar todos os planos no localStorage
    localStorage.setItem("sqm-action-plans", JSON.stringify(updatedAllPlans))

    toast({
      title: isUpdate ? "Plano de ação atualizado" : "Plano de ação criado",
      description: isUpdate ? "O plano de ação foi atualizado com sucesso." : "O plano de ação foi criado com sucesso.",
    })

    setIsDialogOpen(false)
  }

  const updateActionPlan = (updatedPlan: ActionPlan) => {
    // Atualizar na interface
    const updatedUserPlans = actionPlans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    setActionPlans(updatedUserPlans)

    // Aplicar filtros aos planos atualizados
    const filtered = updatedUserPlans.filter((plan) => {
      const matchSquad =
        squadFilter === "all" || assessments.some((a) => a.id === plan.assessmentId && a.squadName === squadFilter)

      const matchValueStream =
        valueStreamFilter === "all" ||
        assessments.some((a) => a.id === plan.assessmentId && a.valueStream === valueStreamFilter)

      return matchSquad && matchValueStream
    })

    setFilteredActionPlans(filtered)

    // Atualizar no localStorage
    const allPlans = JSON.parse(localStorage.getItem("sqm-action-plans") || "[]")
    const updatedAllPlans = allPlans.map((plan: ActionPlan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    localStorage.setItem("sqm-action-plans", JSON.stringify(updatedAllPlans))

    toast({
      title: "Plano de ação atualizado",
      description: "O plano de ação foi atualizado com sucesso.",
    })
  }

  const deleteActionPlan = (planId: string) => {
    // Atualizar na interface
    const updatedUserPlans = actionPlans.filter((plan) => plan.id !== planId)
    setActionPlans(updatedUserPlans)

    // Aplicar filtros aos planos atualizados
    const filtered = updatedUserPlans.filter((plan) => {
      const matchSquad =
        squadFilter === "all" || assessments.some((a) => a.id === plan.assessmentId && a.squadName === squadFilter)

      const matchValueStream =
        valueStreamFilter === "all" ||
        assessments.some((a) => a.id === plan.assessmentId && a.valueStream === valueStreamFilter)

      return matchSquad && matchValueStream
    })

    setFilteredActionPlans(filtered)

    // Atualizar no localStorage
    const allPlans = JSON.parse(localStorage.getItem("sqm-action-plans") || "[]")
    const updatedAllPlans = allPlans.filter((plan: ActionPlan) => plan.id !== planId)
    localStorage.setItem("sqm-action-plans", JSON.stringify(updatedAllPlans))

    toast({
      title: "Plano de ação excluído",
      description: "O plano de ação foi excluído com sucesso.",
    })
  }

  if (isInitializing || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Carregando planos de ação...</p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6 gradient-heading">Planos de Ação</h1>
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle>Nenhuma avaliação encontrada</CardTitle>
              <CardDescription>Você precisa realizar uma avaliação antes de criar planos de ação.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity">
                <Link href="/assessment">Realizar Avaliação</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentUser = getCurrentUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold gradient-heading">Planos de Ação</h1>
              </div>
              <p className="text-muted-foreground">
                Gerencie planos de ação para melhorar a maturidade da squad{" "}
                <span className="font-medium">{assessment.squadName}</span>
                {assessment.valueStream && (
                  <>
                    {" "}
                    - Value Stream: <span className="font-medium">{assessment.valueStream}</span>
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filtros:</span>
                </div>

                <Select value={squadFilter} onValueChange={setSquadFilter}>
                  <SelectTrigger className="w-[180px] border-primary/20">
                    <SelectValue placeholder="Squad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Squads</SelectItem>
                    {availableSquads.map((squad) => (
                      <SelectItem key={squad} value={squad}>
                        {squad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={valueStreamFilter} onValueChange={setValueStreamFilter}>
                  <SelectTrigger className="w-[180px] border-primary/20">
                    <SelectValue placeholder="Value Stream" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Value Streams</SelectItem>
                    {availableValueStreams.map((vs) => (
                      <SelectItem key={vs} value={vs}>
                        {vs}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Visualização:</span>
                <Tabs value={view} onValueChange={(value: "list" | "board") => setView(value)} className="w-[200px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="board">Board</TabsTrigger>
                    <TabsTrigger value="list">Lista</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Práticas com baixa maturidade */}
        {lowMaturityPractices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-primary/10 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle>Práticas com Baixa Maturidade</CardTitle>
                <CardDescription>
                  As seguintes práticas estão com maturidade abaixo de 70% e precisam de planos de ação para melhoria.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowMaturityPractices.map((practice, index) => (
                    <motion.div
                      key={practice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                    >
                      <Card className="border-primary/10 h-full">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground">{practice.categoryName}</p>
                              <CardTitle className="text-base mt-1">
                                {practice.practiceId}. {practice.practiceName}
                              </CardTitle>
                            </div>
                            <Badge className="bg-amber-500">{practice.maturityScore}%</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className="space-y-2 mb-4">
                            {practice.questions.map((question: any) => (
                              <div key={question.id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground truncate mr-2">{question.text}</span>
                                <span
                                  className={`px-1.5 rounded-full text-xs ${
                                    question.score < 30
                                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                      : question.score < 70
                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  }`}
                                >
                                  {question.score}%
                                </span>
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={() => handleCreateActionPlan(practice)}
                            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                            size="sm"
                          >
                            Criar Plano de Ação
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Planos de Ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {view === "board" ? (
            filteredActionPlans.length > 0 ? (
              <ActionPlanBoard
                actionPlans={filteredActionPlans}
                onUpdatePlan={updateActionPlan}
                onDeletePlan={deleteActionPlan}
              />
            ) : (
              <Card className="border-primary/10 shadow-lg shadow-primary/5">
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Nenhum plano de ação encontrado para os filtros selecionados.
                  </p>
                  {lowMaturityPractices.length > 0 && (
                    <p className="text-sm">Crie planos de ação para as práticas com baixa maturidade listadas acima.</p>
                  )}
                </CardContent>
              </Card>
            )
          ) : filteredActionPlans.length > 0 ? (
            <ActionPlanList
              actionPlans={filteredActionPlans}
              onUpdatePlan={updateActionPlan}
              onDeletePlan={deleteActionPlan}
            />
          ) : (
            <Card className="border-primary/10 shadow-lg shadow-primary/5">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Nenhum plano de ação encontrado para os filtros selecionados.
                </p>
                {lowMaturityPractices.length > 0 && (
                  <p className="text-sm">Crie planos de ação para as práticas com baixa maturidade listadas acima.</p>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Dialog para criar/editar plano de ação */}
      {selectedPractice && (
        <ActionPlanDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          practice={selectedPractice}
          onSave={saveActionPlan}
        />
      )}
    </div>
  )
}
