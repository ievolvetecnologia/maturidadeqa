"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart2, FileText, Trash2, BarChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ComparisonView } from "@/components/comparison-view"
import { useToast } from "@/hooks/use-toast"
import type { ActionPlan } from "@/lib/types"

interface Assessment {
  id: string
  squadName: string
  valueStream?: string
  answers: Record<string, number>
  date: string
}

export default function HistoryPage() {
  const { toast } = useToast()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showComparison, setShowComparison] = useState(false)
  const [baseAssessment, setBaseAssessment] = useState<string>("")
  const [compareAssessment, setCompareAssessment] = useState<string>("")
  const [valueStreamFilter, setValueStreamFilter] = useState<string>("all")
  const [squadFilter, setSquadFilter] = useState<string>("all")
  const [availableValueStreams, setAvailableValueStreams] = useState<string[]>([])
  const [availableSquads, setAvailableSquads] = useState<string[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([])

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      // Load assessments from localStorage
      const savedAssessments = JSON.parse(localStorage.getItem("sqm-assessments") || "[]")
      setAssessments(
        savedAssessments.sort(
          (a: Assessment, b: Assessment) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      )

      // Extrair value streams e squads únicos
      const valueStreams = Array.from(
        new Set(
          savedAssessments
            .map((a: Assessment) => a.valueStream)
            .filter(Boolean), // Remover valores vazios
        ),
      )
      setAvailableValueStreams(valueStreams)

      const squads = Array.from(new Set(savedAssessments.map((a: Assessment) => a.squadName)))
      setAvailableSquads(squads)

      // Inicializar avaliações filtradas
      setFilteredAssessments(
        savedAssessments.sort(
          (a: Assessment, b: Assessment) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      )

      // Load action plans
      const savedPlans = localStorage.getItem("sqm-action-plans")
      if (savedPlans) {
        setActionPlans(JSON.parse(savedPlans))
      }

      setIsLoading(false)
    }, 1000)
  }, [])

  // Aplicar filtros quando mudarem
  useEffect(() => {
    if (assessments.length === 0) return

    let filtered = [...assessments]

    // Aplicar filtro de Value Stream
    if (valueStreamFilter !== "all") {
      filtered = filtered.filter((a) => a.valueStream === valueStreamFilter)
    }

    // Aplicar filtro de Squad
    if (squadFilter !== "all") {
      filtered = filtered.filter((a) => a.squadName === squadFilter)
    }

    setFilteredAssessments(filtered)

    // Resetar seleções de avaliações quando os filtros mudarem
    setBaseAssessment("")
    setCompareAssessment("")
    setShowComparison(false)
  }, [valueStreamFilter, squadFilter, assessments])

  const calculateOverallAverage = (assessment: Assessment) => {
    let total = 0
    let count = 0

    Object.values(assessment.answers).forEach((value) => {
      total += value
      count++
    })

    return count > 0 ? Math.round(total / count) : 0
  }

  const getMaturityLevel = (value: number) => {
    if (value < 30) return { label: "Básico", color: "bg-red-500" }
    if (value < 50) return { label: "Em Desenvolvimento", color: "bg-orange-500" }
    if (value < 70) return { label: "Intermediário", color: "bg-yellow-500" }
    if (value < 90) return { label: "Avançado", color: "bg-green-500" }
    return { label: "Excelência", color: "bg-emerald-500" }
  }

  const deleteAssessment = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta avaliação?")) {
      const updatedAssessments = assessments.filter((a) => a.id !== id)
      localStorage.setItem("sqm-assessments", JSON.stringify(updatedAssessments))
      setAssessments(updatedAssessments)

      // Reset comparison if one of the selected assessments is deleted
      if (id === baseAssessment || id === compareAssessment) {
        setShowComparison(false)
        setBaseAssessment("")
        setCompareAssessment("")
      }
    }
  }

  const handleCompare = () => {
    if (!baseAssessment || !compareAssessment) {
      toast({
        title: "Seleção incompleta",
        description: "Por favor, selecione duas avaliações para comparar.",
        variant: "destructive",
      })
      return
    }

    if (baseAssessment === compareAssessment) {
      toast({
        title: "Seleção inválida",
        description: "Por favor, selecione duas avaliações diferentes para comparar.",
        variant: "destructive",
      })
      return
    }

    setShowComparison(true)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    )
  }

  if (assessments.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6 gradient-heading">Histórico de Avaliações</h1>
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle>Nenhuma avaliação encontrada</CardTitle>
              <CardDescription>Você ainda não realizou nenhuma avaliação de maturidade.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-gradient-primary hover:opacity-90 transition-opacity">
                <a href="/assessment">Iniciar Avaliação</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold gradient-heading">Histórico de Avaliações</h1>
            <Link href="/assessment">
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                <FileText className="mr-2 h-4 w-4" />
                Nova Avaliação
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle>Comparar Avaliações</CardTitle>
              <CardDescription>
                Filtre as avaliações e selecione duas para comparar e verificar a evolução das práticas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filtrar por Value Stream</label>
                  <Select value={valueStreamFilter} onValueChange={setValueStreamFilter}>
                    <SelectTrigger className="border-primary/20">
                      <SelectValue placeholder="Selecione um Value Stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Value Streams</SelectItem>
                      {availableValueStreams.map((vs) => (
                        <SelectItem key={vs} value={vs}>
                          {vs}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Filtrar por Squad</label>
                  <Select value={squadFilter} onValueChange={setSquadFilter}>
                    <SelectTrigger className="border-primary/20">
                      <SelectValue placeholder="Selecione uma Squad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Squads</SelectItem>
                      {availableSquads.map((squad) => (
                        <SelectItem key={squad} value={squad}>
                          {squad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Seleção de avaliações para comparação */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Avaliação Base (Anterior)</label>
                  <Select value={baseAssessment} onValueChange={setBaseAssessment}>
                    <SelectTrigger className="border-primary/20">
                      <SelectValue placeholder="Selecione uma avaliação" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAssessments.map((assessment) => (
                        <SelectItem key={assessment.id} value={assessment.id}>
                          {assessment.squadName} - {new Date(assessment.date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Avaliação Atual</label>
                  <Select value={compareAssessment} onValueChange={setCompareAssessment}>
                    <SelectTrigger className="border-primary/20">
                      <SelectValue placeholder="Selecione uma avaliação" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAssessments.map((assessment) => (
                        <SelectItem key={assessment.id} value={assessment.id}>
                          {assessment.squadName} - {new Date(assessment.date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleCompare} className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  <BarChart className="mr-2 h-4 w-4" />
                  Comparar Avaliações
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparison Results */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <ComparisonView
              baseAssessmentId={baseAssessment}
              compareAssessmentId={compareAssessment}
              assessments={assessments}
              actionPlans={actionPlans}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader>
              <CardTitle>Avaliações Realizadas</CardTitle>
              <CardDescription>Histórico de todas as avaliações de maturidade realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-primary/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-primary/5">
                    <TableRow>
                      <TableHead>Squad</TableHead>
                      <TableHead>Value Stream</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Maturidade Média</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssessments.map((assessment, index) => {
                      const average = calculateOverallAverage(assessment)
                      const maturityLevel = getMaturityLevel(average)

                      return (
                        <motion.tr
                          key={assessment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <TableCell className="font-medium">{assessment.squadName}</TableCell>
                          <TableCell>{assessment.valueStream || "-"}</TableCell>
                          <TableCell>{new Date(assessment.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="font-semibold">{average}%</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${maturityLevel.color}`}>{maturityLevel.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-primary/20 hover:border-primary/50"
                              >
                                <Link href={`/dashboard?id=${assessment.id}`}>
                                  <BarChart2 className="h-4 w-4 mr-1" />
                                  Dashboard
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteAssessment(assessment.id)}
                                className="border-primary/20 hover:border-primary/50 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
