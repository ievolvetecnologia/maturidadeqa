"use client"

import { useState } from "react"
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
import { Plus, Trash2 } from "lucide-react"
import { saveCustomPractice } from "@/lib/question-data"
import type { Practice, Question } from "@/lib/question-data"

interface PracticeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: string
  onSave: () => void
}

export function PracticeDialog({ open, onOpenChange, categoryId, onSave }: PracticeDialogProps) {
  const [practiceName, setPracticeName] = useState("")
  const [questions, setQuestions] = useState<Question[]>([{ id: 1, text: "" }])

  const handleAddQuestion = () => {
    const newId = Math.max(0, ...questions.map((q) => q.id)) + 1
    setQuestions([...questions, { id: newId, text: "" }])
  }

  const handleRemoveQuestion = (id: number) => {
    if (questions.length <= 1) {
      return // Manter pelo menos 1 pergunta
    }
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const handleQuestionChange = (id: number, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          return { ...q, text }
        }
        return q
      }),
    )
  }

  const handleSave = () => {
    // Validar campos
    if (!practiceName.trim()) {
      alert("Por favor, informe o nome da prática.")
      return
    }

    // Verificar se todas as perguntas têm texto
    const emptyQuestions = questions.filter((q) => !q.text.trim())
    if (emptyQuestions.length > 0) {
      alert("Por favor, preencha o texto de todas as perguntas.")
      return
    }

    // Criar nova prática
    const newPractice: Practice = {
      id: Date.now(), // ID único baseado no timestamp
      name: practiceName,
      questions: questions.map((q, index) => ({
        id: index + 1, // Reordenar IDs
        text: q.text,
      })),
    }

    // Salvar prática
    saveCustomPractice(categoryId, newPractice)

    // Resetar formulário
    setPracticeName("")
    setQuestions([{ id: 1, text: "" }])

    // Notificar componente pai
    onSave()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="gradient-heading text-xl">Adicionar Nova Prática</DialogTitle>
          <DialogDescription>Crie uma nova prática personalizada para a categoria selecionada.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="practice-name">Nome da Prática</Label>
            <Input
              id="practice-name"
              value={practiceName}
              onChange={(e) => setPracticeName(e.target.value)}
              placeholder="Ex: Automação de Testes de API"
              className="border-primary/20 focus-visible:ring-primary/30"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label>Perguntas</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="border-primary/20 hover:border-primary/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Pergunta
              </Button>
            </div>

            <div className="space-y-4 mt-2">
              {questions.map((question) => (
                <div key={question.id} className="flex gap-2 items-start">
                  <Input
                    value={question.text}
                    onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                    placeholder="Digite a pergunta..."
                    className="border-primary/20 focus-visible:ring-primary/30"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveQuestion(question.id)}
                    disabled={questions.length <= 2}
                    className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-primary hover:opacity-90 transition-opacity">
            Salvar Prática
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
