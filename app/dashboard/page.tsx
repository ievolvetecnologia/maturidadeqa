"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { questionData } from "@/lib/question-data"
import { BarChart, RadarChart, GaugeChart } from "@/components/charts"
import { AlertCircle, ArrowRight, Download, FileDown, Plus, Share2 } from "lucide-react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { ActionPlanDialog } from "@/components/action-plan-dialog"
import { ActionPlanCard } from "@/components/action-plan-card"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import type { ActionPlan } from "@/lib/types"

interface Assessment {
  id: string
  userId: string
  userName: string
  squadName: string
  answers: Record<string, number>
  observations?: Record<string, string>
  date: string
  valueStream?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("id")
  const { toast } = useToast()

  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(true)
  const [lowMaturityPractices, setLowMaturityPractices] = useState<any[]>([])
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPractice, setSelectedPractice] = useState<any>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Adicionar filtros para Value Stream e Squad no Dashboard
  // Primeiro, adicionar os estados para os filtros
  const [valueStreamFilter, setValueStreamFilter] = useState<string>("all")
  const [squadFilter, setSquadFilter] = useState<string>("all")
  const [availableValueStreams, setAvailableValueStreams] = useState<string[]>([])
  const [availableSquads, setAvailableSquads] = useState<string[]>([])
  const [filteredSquads, setFilteredSquads] = useState<string[]>([])

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa fazer login para acessar esta página.",
        variant: "destructive",
      })
      router.push("/login?redirect=/dashboard")
      return
    }

    setIsInitializing(false)
  }, [router, toast])

  useEffect(() => {
    if (isInitializing) return

    // Simulate loading
    setTimeout(() => {
      // Obter o usuário atual
      const currentUser = getCurrentUser()
      if (!currentUser) return

      // Load assessments from localStorage
      const savedAssessments = JSON.parse(localStorage.getItem("sqm-assessments") || "[]")

      // Filtrar avaliações do usuário atual
      const userAssessments = savedAssessments.filter((a: Assessment) => a.userId === currentUser.id)
      setAssessments(userAssessments)

      // Set selected assessment
      let assessment = null
      if (assessmentId) {
        assessment = userAssessments.find((a: Assessment) => a.id === assessmentId)
      } else if (userAssessments.length > 0) {
        assessment = userAssessments[0]
      }

      if (assessment) {
        setSelectedAssessment(assessment)
        findLowMaturityPractices(assessment)
      }

      // Load action plans
      const savedPlans = localStorage.getItem("sqm-action-plans")
      if (savedPlans) {
        const allPlans = JSON.parse(savedPlans)
        // Filtrar planos de ação do usuário atual
        const userPlans = allPlans.filter((plan: ActionPlan) => plan.userId === currentUser.id)
        setActionPlans(userPlans)
      }

      setIsLoading(false)
    }, 1000)
  }, [assessmentId, isInitializing])

  // Adicionar useEffect para extrair os value streams e squads disponíveis
  useEffect(() => {
    if (assessments.length === 0) return

    // Extrair value streams únicos
    const valueStreams = Array.from(
      new Set(
        assessments
          .map((a) => a.valueStream)
          .filter(Boolean), // Remover valores vazios
      ),
    )
    setAvailableValueStreams(valueStreams)

    // Extrair squads únicas
    const squads = Array.from(new Set(assessments.map((a) => a.squadName)))
    setAvailableSquads(squads)
    setFilteredSquads(squads)

    // Resetar filtros quando a lista de avaliações mudar
    setValueStreamFilter("all")
    setSquadFilter("all")
  }, [assessments])

  // Adicionar useEffect para filtrar as squads com base no value stream selecionado
  useEffect(() => {
    if (valueStreamFilter === "all") {
      // Se "all" estiver selecionado, mostrar todas as squads
      setFilteredSquads(availableSquads)
    } else {
      // Caso contrário, filtrar squads pelo value stream selecionado
      const squadsInValueStream = assessments.filter((a) => a.valueStream === valueStreamFilter).map((a) => a.squadName)

      // Remover duplicatas
      const uniqueSquads = Array.from(new Set(squadsInValueStream))
      setFilteredSquads(uniqueSquads)

      // Se a squad atual não estiver no value stream selecionado, resetar o filtro de squad
      if (squadFilter !== "all" && !uniqueSquads.includes(squadFilter)) {
        setSquadFilter("all")
      }
    }
  }, [valueStreamFilter, assessments, availableSquads, squadFilter])

  // Modificar a função handleAssessmentChange para considerar os filtros
  const handleAssessmentChange = (id: string) => {
    const assessment = assessments.find((a) => a.id === id)
    if (assessment) {
      setSelectedAssessment(assessment)
      findLowMaturityPractices(assessment)

      // Atualizar filtros baseado na avaliação selecionada
      if (assessment.valueStream) {
        setValueStreamFilter(assessment.valueStream)
      }
      setSquadFilter(assessment.squadName)
    }
  }

  // Adicionar função para filtrar avaliações
  const getFilteredAssessments = () => {
    return assessments.filter((assessment) => {
      const matchValueStream = valueStreamFilter === "all" || assessment.valueStream === valueStreamFilter
      const matchSquad = squadFilter === "all" || assessment.squadName === squadFilter
      return matchValueStream && matchSquad
    })
  }

  // Adicionar função para selecionar a avaliação mais recente que corresponde aos filtros
  const selectFilteredAssessment = () => {
    const filtered = getFilteredAssessments()
    if (filtered.length > 0) {
      const mostRecent = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      setSelectedAssessment(mostRecent)
      findLowMaturityPractices(mostRecent)
    } else {
      setSelectedAssessment(null)
    }
  }

  // Adicionar useEffect para atualizar a avaliação selecionada quando os filtros mudarem
  useEffect(() => {
    if (isInitializing || isLoading) return
    if (assessments.length === 0) return

    selectFilteredAssessment()
  }, [valueStreamFilter, squadFilter])

  const findLowMaturityPractices = (assessment: Assessment) => {
    if (!assessment) return

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

    setLowMaturityPractices(lowMaturityItems)
  }

  const calculateCategoryAverage = (categoryId: string) => {
    if (!selectedAssessment) return 0

    const category = questionData.find((c) => c.id === categoryId)
    if (!category) return 0

    let total = 0
    let count = 0

    category.practices.forEach((practice) => {
      practice.questions.forEach((question) => {
        const questionId = `${categoryId}-${practice.id}-${question.id}`
        if (selectedAssessment.answers[questionId] !== undefined) {
          total += selectedAssessment.answers[questionId]
          count++
        }
      })
    })

    return count > 0 ? Math.round(total / count) : 0
  }

  const calculatePracticeAverage = (categoryId: string, practiceId: number) => {
    if (!selectedAssessment) return 0

    const category = questionData.find((c) => c.id === categoryId)
    if (!category) return 0

    const practice = category.practices.find((p) => p.id === practiceId)
    if (!practice) return 0

    let total = 0
    let count = 0

    practice.questions.forEach((question) => {
      const questionId = `${categoryId}-${practiceId}-${question.id}`
      if (selectedAssessment.answers[questionId] !== undefined) {
        total += selectedAssessment.answers[questionId]
        count++
      }
    })

    return count > 0 ? Math.round(total / count) : 0
  }

  const calculateOverallAverage = () => {
    if (!selectedAssessment) return 0

    let total = 0
    let count = 0

    Object.values(selectedAssessment.answers).forEach((value) => {
      total += value
      count++
    })

    return count > 0 ? Math.round(total / count) : 0
  }

  const getCategoryData = () => {
    return questionData.map((category) => ({
      name: category.name,
      value: calculateCategoryAverage(category.id),
    }))
  }

  const getPracticeData = (categoryId: string) => {
    const category = questionData.find((c) => c.id === categoryId)
    if (!category) return []

    return category.practices.map((practice) => ({
      name: `${practice.id}. ${practice.name}`,
      value: calculatePracticeAverage(categoryId, practice.id),
    }))
  }

  const getMaturityLevel = (value: number) => {
    if (value < 30) return { label: "Básico", color: "bg-red-500" }
    if (value < 50) return { label: "Em Desenvolvimento", color: "bg-orange-500" }
    if (value < 70) return { label: "Intermediário", color: "bg-yellow-500" }
    if (value < 90) return { label: "Avançado", color: "bg-green-500" }
    return { label: "Excelência", color: "bg-emerald-500" }
  }

  const exportToPDF = async () => {
    if (!selectedAssessment) return

    setIsExporting(true)

    try {
      // Import libraries dynamically to reduce initial load time
      const { default: jsPDF } = await import("jspdf")
      const { default: html2canvas } = await import("html2canvas")

      const doc = new jsPDF("p", "mm", "a4")
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      let yPos = 20

      // Add title
      doc.setFontSize(18)
      doc.setTextColor(105, 16, 234) // Primary color
      doc.text("Relatório de Avaliação de Maturidade", pageWidth / 2, yPos, { align: "center" })
      yPos += 10

      // Add squad info
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text(`Squad: ${selectedAssessment.squadName}`, margin, yPos)
      yPos += 7

      // Add value stream info if available
      if (selectedAssessment.valueStream) {
        doc.text(`Value Stream: ${selectedAssessment.valueStream}`, margin, yPos)
        yPos += 7
      }

      // Add user info
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Avaliado por: ${selectedAssessment.userName}`, margin, yPos)
      yPos += 7

      // Add date
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Data da avaliação: ${new Date(selectedAssessment.date).toLocaleDateString()}`, margin, yPos)
      yPos += 15

      // Add overall maturity
      const overallAverage = calculateOverallAverage()
      const maturityLevel = getMaturityLevel(overallAverage)

      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text("Maturidade Geral", margin, yPos)
      yPos += 7

      doc.setFontSize(24)
      doc.text(`${overallAverage}%`, margin, yPos)

      doc.setFontSize(12)

      // Add maturity level with colored background
      const levelText = maturityLevel.label
      const textWidth = (doc.getStringUnitWidth(levelText) * 12) / doc.internal.scaleFactor

      // Draw colored rectangle for maturity level
      const rectWidth = textWidth + 10
      const rectHeight = 7
      const rectX = margin + 40
      const rectY = yPos - 5

      let fillColor
      if (maturityLevel.color.includes("red")) fillColor = [239, 68, 68]
      else if (maturityLevel.color.includes("orange")) fillColor = [249, 115, 22]
      else if (maturityLevel.color.includes("yellow")) fillColor = [234, 179, 8]
      else if (maturityLevel.color.includes("green")) fillColor = [34, 197, 94]
      else fillColor = [16, 185, 129]

      doc.setFillColor(fillColor[0], fillColor[1], fillColor[2])
      doc.roundedRect(rectX, rectY, rectWidth, rectHeight, 2, 2, "F")

      doc.setTextColor(255, 255, 255)
      doc.text(levelText, rectX + 5, yPos)
      yPos += 20

      // Add category summaries
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(14)
      doc.text("Maturidade por Categoria", margin, yPos)
      yPos += 10

      const categoryData = getCategoryData()

      doc.setFontSize(12)
      categoryData.forEach((category) => {
        doc.text(`${category.name}: ${category.value}%`, margin, yPos)

        // Draw progress bar
        const barWidth = 100
        const barHeight = 5
        const barX = margin + 70
        const barY = yPos - 3

        // Background
        doc.setFillColor(230, 230, 230)
        doc.roundedRect(barX, barY, barWidth, barHeight, 1, 1, "F")

        // Progress
        doc.setFillColor(105, 16, 234)
        doc.roundedRect(barX, barY, barWidth * (category.value / 100), barHeight, 1, 1, "F")

        yPos += 10

        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
      })

      yPos += 10

      // Add detailed practice information for each category
      questionData.forEach((category) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.setTextColor(105, 16, 234)
        doc.text(category.name, margin, yPos)
        yPos += 7

        category.practices.forEach((practice) => {
          const practiceAvg = calculatePracticeAverage(category.id, practice.id)
          const practiceId = `${category.id}-${practice.id}`
          const observation = selectedAssessment.observations?.[practiceId] || ""

          doc.setFontSize(12)
          doc.setTextColor(0, 0, 0)
          doc.text(`${practice.id}. ${practice.name}: ${practiceAvg}%`, margin, yPos)
          yPos += 7

          // Add questions and scores
          doc.setFontSize(10)
          doc.setTextColor(100, 100, 100)

          practice.questions.forEach((question) => {
            const questionId = `${category.id}-${practice.id}-${question.id}`
            const score = selectedAssessment.answers[questionId] || 0

            // Truncate question text if too long
            let questionText = question.text
            if (questionText.length > 70) {
              questionText = questionText.substring(0, 67) + "..."
            }

            doc.text(`• ${questionText}: ${score}%`, margin + 5, yPos)
            yPos += 5

            // Check if we need a new page
            if (yPos > 270) {
              doc.addPage()
              yPos = 20
            }
          })

          // Add observation if exists
          if (observation) {
            doc.setFontSize(10)
            doc.setTextColor(80, 80, 80)
            doc.text("Observação:", margin + 5, yPos)
            yPos += 5

            // Handle multiline observations
            const splitObservation = doc.splitTextToSize(observation, pageWidth - margin * 2 - 10)
            splitObservation.forEach((line) => {
              doc.text(line, margin + 10, yPos)
              yPos += 5

              // Check if we need a new page
              if (yPos > 270) {
                doc.addPage()
                yPos = 20
              }
            })
          }

          yPos += 5

          // Check if we need a new page
          if (yPos > 260) {
            doc.addPage()
            yPos = 20
          }
        })

        yPos += 10
      })

      // Add footer with date
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Relatório gerado em ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} | Página ${i} de ${totalPages}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" },
        )
      }

      // Save the PDF
      doc.save(`sqm-assessment-${selectedAssessment.squadName}.pdf`)

      toast({
        title: "PDF gerado com sucesso",
        description: "O relatório foi baixado para o seu computador.",
      })
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = () => {
    if (!selectedAssessment) return

    let csv = "Categoria,Prática,Pergunta,Valor\n"

    questionData.forEach((category) => {
      category.practices.forEach((practice) => {
        practice.questions.forEach((question) => {
          const questionId = `${category.id}-${practice.id}-${question.id}`
          const value = selectedAssessment.answers[questionId] || 0
          csv += `"${category.name}","${practice.id}. ${practice.name}","${question.text}",${value}\n`
        })
      })
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `sqm-assessment-${selectedAssessment.squadName}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCreateActionPlan = (practice: any) => {
    setSelectedPractice(practice)
    setIsDialogOpen(true)
  }

  const saveActionPlan = (actionPlan: ActionPlan) => {
    const currentUser = getCurrentUser()
    if (!currentUser) return

    // Adicionar ID do usuário ao plano de ação
    const planWithUser = {
      ...actionPlan,
      userId: currentUser.id,
      userName: currentUser.name,
    }

    // Carregar todos os planos existentes
    const allPlans = JSON.parse(localStorage.getItem("sqm-action-plans") || "[]")
    const updatedAllPlans = [...allPlans, planWithUser]

    // Atualizar apenas os planos do usuário atual na interface
    const updatedUserPlans = [...actionPlans, planWithUser]
    setActionPlans(updatedUserPlans)

    // Salvar todos os planos no localStorage
    localStorage.setItem("sqm-action-plans", JSON.stringify(updatedAllPlans))

    toast({
      title: "Plano de ação criado",
      description: "O plano de ação foi criado com sucesso.",
    })

    setIsDialogOpen(false)
  }

  const updateActionPlan = (updatedPlan: ActionPlan) => {
    // Atualizar na interface
    const updatedUserPlans = actionPlans.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    setActionPlans(updatedUserPlans)

    // Atualizar no localStorage
    const allPlans = JSON.parse(localStorage.getItem("sqm-action-plans") || "[]")
    const updatedAllPlans = allPlans.map((plan: ActionPlan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    localStorage.setItem("sqm-action-plans", JSON.stringify(updatedAllPlans))
  }

  const deleteActionPlan = (planId: string) => {
    // Atualizar na interface
    const updatedUserPlans = actionPlans.filter((plan) => plan.id !== planId)
    setActionPlans(updatedUserPlans)

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
          <p className="text-lg font-medium text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (assessments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6 gradient-heading">Dashboard</h1>
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle>Nenhuma avaliação encontrada</CardTitle>
              <CardDescription>Você ainda não realizou nenhuma avaliação de maturidade.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity">
                <Link href="/assessment">Iniciar Avaliação</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!selectedAssessment) {
    return <div>Carregando...</div>
  }

  const overallAverage = calculateOverallAverage()
  const maturityLevel = getMaturityLevel(overallAverage)
  const currentUser = getCurrentUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-heading">Dashboard de Maturidade</h1>
            <p className="text-muted-foreground">
              Análise de maturidade para <span className="font-medium">{selectedAssessment.squadName}</span>
              {selectedAssessment.valueStream && (
                <>
                  {" "}
                  - Value Stream: <span className="font-medium">{selectedAssessment.valueStream}</span>
                </>
              )}
            </p>
            <p className="text-muted-foreground">
              Usuário: <span className="font-medium">{currentUser?.name}</span>
            </p>
          </div>

          {/* Adicionar os componentes de filtro na interface */}
          {/* Localizar a div que contém o Select para escolher avaliação e adicionar os filtros antes */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
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

              <Select value={squadFilter} onValueChange={setSquadFilter}>
                <SelectTrigger className="w-[180px] border-primary/20">
                  <SelectValue placeholder="Squad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Squads</SelectItem>
                  {filteredSquads.map((squad) => (
                    <SelectItem key={squad} value={squad}>
                      {squad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedAssessment?.id}
                onValueChange={handleAssessmentChange}
                disabled={getFilteredAssessments().length === 0}
              >
                <SelectTrigger className="w-[240px] border-primary/20">
                  <SelectValue placeholder="Selecione uma avaliação" />
                </SelectTrigger>
                <SelectContent>
                  {getFilteredAssessments().map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.squadName} - {new Date(assessment.date).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={exportToPDF}
                className="border-primary/20 hover:border-primary/50"
                disabled={isExporting || !selectedAssessment}
              >
                {isExporting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                <span className="sr-only">Exportar PDF</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={exportToCSV}
                className="border-primary/20 hover:border-primary/50"
                disabled={!selectedAssessment}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Exportar CSV</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-primary/20 hover:border-primary/50"
                disabled={!selectedAssessment}
              >
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Compartilhar</span>
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-primary/10 shadow-lg shadow-primary/5 overflow-hidden">
              <div className="h-2 bg-gradient-primary" />
              <CardHeader className="pb-2">
                <CardTitle>Maturidade Geral</CardTitle>
                <CardDescription>Média de todas as práticas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56 flex items-center justify-center">
                  <GaugeChart value={overallAverage} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="border-primary/10 shadow-lg shadow-primary/5 h-full">
              <CardHeader className="pb-2">
                <CardTitle>Maturidade por Categoria</CardTitle>
                <CardDescription>Média de cada categoria de práticas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <RadarChart data={getCategoryData()} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Planos de Ação Section */}
        {lowMaturityPractices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <Card className="border-primary/10 shadow-lg shadow-primary/5 overflow-hidden">
              <div className="h-1 bg-gradient-primary" />
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <CardTitle>Práticas com Baixa Maturidade</CardTitle>
                  </div>
                  <Link href={`/action-plans?id=${selectedAssessment.id}`}>
                    <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/50">
                      Ver Board Completo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>
                  As seguintes práticas estão com maturidade abaixo de 70% e precisam de planos de ação para melhoria.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowMaturityPractices.slice(0, 3).map((practice, index) => (
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
                            <Plus className="h-4 w-4 mr-1" /> Criar Plano de Ação
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {lowMaturityPractices.length > 3 && (
                  <div className="mt-4 text-center">
                    <Link href={`/action-plans?id=${selectedAssessment.id}`}>
                      <Button variant="outline" className="border-primary/20 hover:border-primary/50">
                        Ver todas as {lowMaturityPractices.length} práticas com baixa maturidade
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Plans Board Preview */}
        {actionPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-8"
          >
            <Card className="border-primary/10 shadow-lg shadow-primary/5">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Planos de Ação Recentes</CardTitle>
                  <Link href="/action-plans">
                    <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/50">
                      Ver Board Completo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription>Acompanhe o progresso dos planos de ação para melhorar a maturidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {actionPlans.slice(0, 3).map((plan) => (
                    <ActionPlanCard
                      key={plan.id}
                      plan={plan}
                      onEdit={() => {
                        setSelectedPractice({
                          id: plan.practiceId,
                          categoryName: plan.categoryName,
                          practiceName: plan.practiceName,
                          maturityScore: plan.maturityScore,
                        })
                        setIsDialogOpen(true)
                      }}
                      onDelete={() => deleteActionPlan(plan.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle>Detalhamento por Categoria</CardTitle>
              <CardDescription>Análise detalhada de cada categoria e suas práticas</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={questionData[0].id} className="w-full">
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

                {questionData.map((category) => (
                  <TabsContent key={category.id} value={category.id}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-primary/10">
                        <CardHeader>
                          <CardTitle>Práticas de {category.name}</CardTitle>
                          <CardDescription>Nível de maturidade por prática</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-80">
                            <BarChart data={getPracticeData(category.id)} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-primary/10">
                        <CardHeader>
                          <CardTitle>Detalhamento</CardTitle>
                          <CardDescription>Análise detalhada das práticas</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                            {category.practices.map((practice) => {
                              const average = calculatePracticeAverage(category.id, practice.id)
                              const maturityLevel = getMaturityLevel(average)
                              const needsActionPlan = average < 70

                              return (
                                <div
                                  key={practice.id}
                                  className="border border-primary/10 rounded-lg p-4 transition-all hover:shadow-md"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-medium">
                                      {practice.id}. {practice.name}
                                    </h3>
                                    <Badge className={`${maturityLevel.color}`}>{average}%</Badge>
                                  </div>
                                  <div className="space-y-2">
                                    {practice.questions.map((question) => {
                                      const questionId = `${category.id}-${practice.id}-${question.id}`
                                      const value = selectedAssessment.answers[questionId] || 0
                                      return (
                                        <div key={question.id} className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">{question.text}</span>
                                          <span
                                            className={`px-1.5 rounded-full text-xs ${
                                              value < 30
                                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                : value < 70
                                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            }`}
                                          >
                                            {value}%
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                  {needsActionPlan && (
                                    <div className="mt-4">
                                      <Button
                                        onClick={() =>
                                          handleCreateActionPlan({
                                            id: `${category.id}-${practice.id}`,
                                            categoryId: category.id,
                                            categoryName: category.name,
                                            practiceId: practice.id,
                                            practiceName: practice.name,
                                            maturityScore: average,
                                            questions: practice.questions.map((q) => ({
                                              id: q.id,
                                              text: q.text,
                                              score:
                                                selectedAssessment.answers[`${category.id}-${practice.id}-${q.id}`] ||
                                                0,
                                            })),
                                          })
                                        }
                                        size="sm"
                                        variant="outline"
                                        className="w-full border-primary/20 hover:border-primary/50"
                                      >
                                        <Plus className="h-4 w-4 mr-1" /> Criar Plano de Ação
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <ActionPlanDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        practice={selectedPractice}
        onSave={saveActionPlan}
      />
    </div>
  )
}
