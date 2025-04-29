"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { getQuestionData, isCustomPractice } from "@/lib/question-data"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Plus, Save, Send, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { isAuthenticated, getCurrentUser } from "@/lib/auth"
import { PracticeDialog } from "@/components/practice-dialog"

export default function AssessmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [squadName, setSquadName] = useState("")
  const [valueStream, setValueStream] = useState("")
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [observations, setObservations] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [activeCategory, setActiveCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [questionData, setQuestionData] = useState(getQuestionData())
  const [isAdmin, setIsAdmin] = useState(false)
  const [isPracticeDialogOpen, setIsPracticeDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Acesso restrito",
        description: "Você precisa fazer login para acessar esta página.",
        variant: "destructive",
      })
      router.push("/login?redirect=/assessment")
      return
    }

    // Verificar se o usuário é administrador
    const currentUser = getCurrentUser()
    if (currentUser) {
      setIsAdmin(currentUser.role === "admin")
    }

    setIsInitializing(false)
  }, [router, toast])

  // Calculate total questions
  const totalQuestions = questionData.reduce((acc, category) => {
    return (
      acc +
      category.practices.reduce((practiceAcc, practice) => {
        return practiceAcc + practice.questions.length
      }, 0)
    )
  }, 0)

  useEffect(() => {
    if (isInitializing) return

    // Obter o usuário atual
    const currentUser = getCurrentUser()
    if (!currentUser) return

    // Load saved progress for this user
    const savedProgress = localStorage.getItem(`sqm-assessment-progress-${currentUser.id}`)
    if (savedProgress) {
      try {
        const {
          squadName: savedName,
          valueStream: savedValueStream,
          answers: savedAnswers,
          observations: savedObservations,
        } = JSON.parse(savedProgress)
        setSquadName(savedName || "")
        setValueStream(savedValueStream || "")
        setAnswers(savedAnswers || {})
        setObservations(savedObservations || {})
      } catch (error) {
        console.error("Error loading saved progress:", error)
      }
    }

    // Set first category as active by default
    if (questionData.length > 0) {
      setActiveCategory(questionData[0].id)
    }
  }, [isInitializing, questionData])

  useEffect(() => {
    if (isInitializing) return

    // Calculate progress
    const answeredQuestions = Object.keys(answers).length
    const calculatedProgress = Math.round((answeredQuestions / totalQuestions) * 100)
    setProgress(calculatedProgress)
  }, [answers, totalQuestions, isInitializing])

  // Atualizar os dados das questões quando houver mudanças
  useEffect(() => {
    // Adicionar um listener para mudanças no localStorage
    const handleStorageChange = () => {
      setQuestionData(getQuestionData())
    }

    window.addEventListener("storage", handleStorageChange)

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const handleSliderChange = (questionId: string, value: number[]) => {
    if (isInitializing) return

    const currentUser = getCurrentUser()
    if (!currentUser) return

    const newValue = value[0]
    setAnswers((prev) => ({
      ...prev,
      [questionId]: newValue,
    }))

    // Save to localStorage
    localStorage.setItem(
      `sqm-assessment-progress-${currentUser.id}`,
      JSON.stringify({
        squadName,
        valueStream,
        answers: {
          ...answers,
          [questionId]: newValue,
        },
        observations,
      }),
    )
  }

  const handleObservationChange = (practiceId: string, value: string) => {
    if (isInitializing) return

    const currentUser = getCurrentUser()
    if (!currentUser) return

    setObservations((prev) => ({
      ...prev,
      [practiceId]: value,
    }))

    // Save to localStorage
    localStorage.setItem(
      `sqm-assessment-progress-${currentUser.id}`,
      JSON.stringify({
        squadName,
        valueStream,
        answers,
        observations: {
          ...observations,
          [practiceId]: value,
        },
      }),
    )
  }

  const saveProgress = () => {
    if (isInitializing) return

    const currentUser = getCurrentUser()
    if (!currentUser) return

    localStorage.setItem(
      `sqm-assessment-progress-${currentUser.id}`,
      JSON.stringify({
        squadName,
        valueStream,
        answers,
        observations,
      }),
    )

    toast({
      title: "Progresso salvo",
      description: "Seu progresso foi salvo com sucesso.",
    })
  }

  const handleSubmit = () => {
    if (isInitializing) return

    const currentUser = getCurrentUser()
    if (!currentUser) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar a avaliação.",
        variant: "destructive",
      })
      return
    }

    if (!squadName) {
      toast({
        title: "Nome da squad é obrigatório",
        description: "Por favor, informe o nome da squad antes de continuar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate loading
    setTimeout(() => {
      // Save completed assessment
      const timestamp = new Date().toISOString()
      const assessmentData = {
        id: timestamp,
        userId: currentUser.id,
        userName: currentUser.name,
        squadName,
        valueStream,
        answers,
        observations,
        date: timestamp,
      }

      // Save to localStorage
      const savedAssessments = JSON.parse(localStorage.getItem("sqm-assessments") || "[]")
      localStorage.setItem("sqm-assessments", JSON.stringify([...savedAssessments, assessmentData]))

      // Clear progress
      localStorage.removeItem(`sqm-assessment-progress-${currentUser.id}`)

      toast({
        title: "Avaliação concluída!",
        description: "Os resultados estão disponíveis no dashboard.",
      })

      // Redirect to dashboard
      router.push(`/dashboard?id=${timestamp}`)
    }, 1500)
  }

  const handleAddPractice = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setIsPracticeDialogOpen(true)
  }

  const handlePracticeSaved = () => {
    // Recarregar os dados das questões
    setQuestionData(getQuestionData())

    // Fechar o diálogo
    setIsPracticeDialogOpen(false)

    toast({
      title: "Prática adicionada",
      description: "A nova prática foi adicionada com sucesso.",
    })
  }

  if (isInitializing) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  const currentUser = getCurrentUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold gradient-heading">Avaliação de Maturidade</h1>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
        </div>

        <div className="mb-4">
          <p className="text-muted-foreground">
            Usuário: <span className="font-medium">{currentUser?.name}</span>
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progresso da avaliação</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" indicatorClassName="bg-gradient-primary" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mb-8 border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle>Informações da Squad</CardTitle>
              <CardDescription>Identifique a squad que está sendo avaliada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="squad-name">Nome da Squad</Label>
                  <Input
                    id="squad-name"
                    placeholder="Ex: Squad Pagamentos"
                    value={squadName}
                    onChange={(e) => setSquadName(e.target.value)}
                    className="border-primary/20 focus-visible:ring-primary/30"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="value-stream">Value Stream</Label>
                  <Input
                    id="value-stream"
                    placeholder="Ex: Financeiro"
                    value={valueStream}
                    onChange={(e) => setValueStream(e.target.value)}
                    className="border-primary/20 focus-visible:ring-primary/30"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 gradient-heading">Questionário de Avaliação</h2>
          <p className="text-muted-foreground mb-6">
            Avalie cada prática com uma nota de 0% a 100%, onde 0% significa que a prática não é aplicada e 100%
            significa que a prática é totalmente aplicada e madura.
          </p>

          {questionData.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              <Accordion
                type="single"
                collapsible
                className="mb-6"
                value={activeCategory === category.id ? category.id : undefined}
                onValueChange={(value) => setActiveCategory(value)}
              >
                <AccordionItem value={category.id} className="border-primary/10">
                  <AccordionTrigger className="text-xl font-medium hover:text-primary">
                    {category.name}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid gap-4">
                      {isAdmin && (
                        <div className="flex justify-end mb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddPractice(category.id)}
                            className="border-primary/20 hover:border-primary/50"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Prática
                          </Button>
                        </div>
                      )}

                      {category.practices.map((practice, practiceIndex) => (
                        <motion.div
                          key={`${category.id}-${practice.id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: practiceIndex * 0.1 }}
                        >
                          <Card className="mb-4 border-primary/10 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">
                                  {practice.id}. {practice.name}
                                </CardTitle>
                                {isAdmin && isCustomPractice(category.id, practice.id) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                                    onClick={() => {
                                      if (confirm("Tem certeza que deseja excluir esta prática personalizada?")) {
                                        import("@/lib/question-data").then(({ deleteCustomPractice }) => {
                                          deleteCustomPractice(category.id, practice.id)
                                          setQuestionData(getQuestionData())
                                          toast({
                                            title: "Prática excluída",
                                            description: "A prática personalizada foi excluída com sucesso.",
                                          })
                                        })
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                              {practice.questions.map((question) => {
                                const questionId = `${category.id}-${practice.id}-${question.id}`
                                const value = answers[questionId] || 0

                                return (
                                  <div className="mb-6" key={questionId}>
                                    <div className="flex justify-between mb-2">
                                      <Label>{question.text}</Label>
                                      <span
                                        className={`font-medium px-2 py-0.5 rounded-full text-sm ${
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
                                    <Slider
                                      value={[value]}
                                      max={100}
                                      step={5}
                                      onValueChange={(val) => handleSliderChange(questionId, val)}
                                      className="py-2"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                      <span>Não aplicado</span>
                                      <span>Parcialmente aplicado</span>
                                      <span>Totalmente aplicado</span>
                                    </div>
                                  </div>
                                )
                              })}

                              <div className="mt-6 border-t border-primary/10 pt-4">
                                <Label htmlFor={`observation-${category.id}-${practice.id}`} className="mb-2 block">
                                  Observações sobre esta prática:
                                </Label>
                                <Textarea
                                  id={`observation-${category.id}-${practice.id}`}
                                  placeholder="Adicione observações, comentários ou justificativas sobre esta prática..."
                                  value={observations[`${category.id}-${practice.id}`] || ""}
                                  onChange={(e) =>
                                    handleObservationChange(`${category.id}-${practice.id}`, e.target.value)
                                  }
                                  className="min-h-[100px] border-primary/20 focus-visible:ring-primary/30"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" onClick={saveProgress} className="border-primary/20 hover:border-primary/50">
            <Save className="mr-2 h-4 w-4" />
            Salvar Progresso
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processando...
              </>
            ) : (
              <>
                Finalizar Avaliação
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Diálogo para adicionar nova prática */}
      {selectedCategory && (
        <PracticeDialog
          open={isPracticeDialogOpen}
          onOpenChange={setIsPracticeDialogOpen}
          categoryId={selectedCategory}
          onSave={handlePracticeSaved}
        />
      )}
    </div>
  )
}
