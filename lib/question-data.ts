// Tipos para as questões, práticas e categorias
export interface Question {
  id: number
  text: string
}

export interface Practice {
  id: number
  name: string
  questions: Question[]
}

export interface Category {
  id: string
  name: string
  practices: Practice[]
}

// Dados padrão das questões
export const questionData: Category[] = [
  {
    id: "modelo-operacional",
    name: "Modelo Operacional",
    practices: [
      {
        id: 1,
        name: "Requisitos e Estórias",
        questions: [
          {
            id: 1,
            text: "Documenta todos os itens e critérios de aceite nas histórias?",
          },
          {
            id: 2,
            text: "Mantém rastreabilidade entre requisitos e testes?",
          },
        ],
      },
      {
        id: 2,
        name: "Ritos Ágeis",
        questions: [
          {
            id: 1,
            text: "Aplica todos os ritos de iterações do projeto? (Daily, Review, Retro, Planning)",
          },
          {
            id: 2,
            text: "Utiliza métricas ágeis para acompanhamento do progresso?",
          },
        ],
      },
    ],
  },
  {
    id: "desenvolvimento",
    name: "Desenvolvimento",
    practices: [
      {
        id: 3,
        name: "Gestão de Configuração",
        questions: [
          {
            id: 1,
            text: "Realiza os testes mantendo a integridade de versionamento nos ambientes (desenvolvimento, testes e homologação)?",
          },
          {
            id: 2,
            text: "Utiliza branches e estratégias de merge adequadas?",
          },
        ],
      },
      {
        id: 4,
        name: "Práticas de Código",
        questions: [
          {
            id: 1,
            text: "Implementa revisão de código (code review) antes de integrar?",
          },
          {
            id: 2,
            text: "Utiliza padrões de codificação consistentes?",
          },
        ],
      },
    ],
  },
  {
    id: "ambiente-massa",
    name: "Ambiente e Massa de Testes",
    practices: [
      {
        id: 5,
        name: "Infraestrutura de Testes",
        questions: [
          {
            id: 1,
            text: "Possui ambientes dedicados para testes automatizados?",
          },
          {
            id: 2,
            text: "Implementa infraestrutura como código para ambientes de teste?",
          },
        ],
      },
      {
        id: 6,
        name: "Dados de Teste",
        questions: [
          {
            id: 1,
            text: "Mantém dados de teste consistentes e atualizados?",
          },
          {
            id: 2,
            text: "Utiliza técnicas de mascaramento de dados sensíveis?",
          },
        ],
      },
    ],
  },
  {
    id: "testes-funcionais",
    name: "Testes Funcionais",
    practices: [
      {
        id: 7,
        name: "Automação de Testes",
        questions: [
          {
            id: 1,
            text: "Implementa testes automatizados para funcionalidades críticas?",
          },
          {
            id: 2,
            text: "Mantém cobertura de testes adequada?",
          },
        ],
      },
      {
        id: 8,
        name: "Testes de Regressão",
        questions: [
          {
            id: 1,
            text: "Executa testes de regressão a cada nova versão?",
          },
          {
            id: 2,
            text: "Prioriza testes de regressão baseados em risco?",
          },
        ],
      },
    ],
  },
  {
    id: "seguranca",
    name: "Segurança",
    practices: [
      {
        id: 9,
        name: "Testes de Segurança",
        questions: [
          {
            id: 1,
            text: "Realiza análise de vulnerabilidades regularmente?",
          },
          {
            id: 2,
            text: "Implementa testes de penetração?",
          },
        ],
      },
      {
        id: 10,
        name: "Proteção de Dados",
        questions: [
          {
            id: 1,
            text: "Aplica princípios de privacidade por design?",
          },
          {
            id: 2,
            text: "Implementa controles de acesso adequados?",
          },
        ],
      },
    ],
  },
  {
    id: "testes-nao-funcionais",
    name: "Testes Não Funcionais",
    practices: [
      {
        id: 11,
        name: "Performance",
        questions: [
          {
            id: 1,
            text: "Realiza testes de carga e stress regularmente?",
          },
          {
            id: 2,
            text: "Monitora métricas de performance em produção?",
          },
        ],
      },
      {
        id: 12,
        name: "Usabilidade",
        questions: [
          {
            id: 1,
            text: "Conduz testes de usabilidade com usuários reais?",
          },
          {
            id: 2,
            text: "Implementa feedback de usuários no ciclo de desenvolvimento?",
          },
        ],
      },
    ],
  },
]

// Função para obter as questões padrão e personalizadas
export function getQuestionData(): Category[] {
  // Obter questões personalizadas do localStorage
  const customQuestionsStr = localStorage.getItem("sqm-custom-questions")
  const customQuestions = customQuestionsStr ? JSON.parse(customQuestionsStr) : []

  // Se não houver questões personalizadas, retornar apenas as padrão
  if (!customQuestions || customQuestions.length === 0) {
    return questionData
  }

  // Combinar questões padrão com personalizadas
  const combinedData = [...questionData]

  // Para cada questão personalizada, encontrar a categoria correspondente e adicionar a prática
  customQuestions.forEach((customQuestion: { categoryId: string; practice: Practice }) => {
    const categoryIndex = combinedData.findIndex((category) => category.id === customQuestion.categoryId)
    if (categoryIndex !== -1) {
      // Encontrar o maior ID de prática na categoria
      const maxPracticeId = Math.max(...combinedData[categoryIndex].practices.map((p) => p.id))

      // Adicionar a prática personalizada com ID único
      combinedData[categoryIndex].practices.push({
        ...customQuestion.practice,
        id: customQuestion.practice.id || maxPracticeId + 1,
      })
    }
  })

  return combinedData
}

// Garantir que o nome da prática seja preservado exatamente como definido pelo usuário
export function saveCustomPractice(categoryId: string, practice: Practice): void {
  // Obter práticas personalizadas existentes
  const customQuestionsStr = localStorage.getItem("sqm-custom-questions")
  const customQuestions = customQuestionsStr ? JSON.parse(customQuestionsStr) : []

  // Adicionar nova prática
  customQuestions.push({
    categoryId,
    practice: {
      ...practice,
      // Garantir que cada questão tenha um ID único
      questions: practice.questions.map((q, index) => ({
        ...q,
        id: q.id || index + 1,
      })),
    },
  })

  // Salvar no localStorage
  localStorage.setItem("sqm-custom-questions", JSON.stringify(customQuestions))

  // Disparar evento para atualizar os dados em outros componentes
  window.dispatchEvent(new Event("storage"))
}

// Função para excluir uma prática personalizada
export function deleteCustomPractice(categoryId: string, practiceId: number): void {
  // Obter práticas personalizadas existentes
  const customQuestionsStr = localStorage.getItem("sqm-custom-questions")
  const customQuestions = customQuestionsStr ? JSON.parse(customQuestionsStr) : []

  // Filtrar para remover a prática específica
  const updatedCustomQuestions = customQuestions.filter(
    (item: { categoryId: string; practice: Practice }) =>
      !(item.categoryId === categoryId && item.practice.id === practiceId),
  )

  // Salvar no localStorage
  localStorage.setItem("sqm-custom-questions", JSON.stringify(updatedCustomQuestions))
}

// Função para verificar se uma prática é personalizada
export function isCustomPractice(categoryId: string, practiceId: number): boolean {
  // Verificar se a prática existe nos dados padrão
  const category = questionData.find((c) => c.id === categoryId)
  if (category) {
    const practiceExists = category.practices.some((p) => p.id === practiceId)
    if (practiceExists) {
      return false // É uma prática padrão
    }
  }

  // Verificar se existe nas práticas personalizadas
  const customQuestionsStr = localStorage.getItem("sqm-custom-questions")
  const customQuestions = customQuestionsStr ? JSON.parse(customQuestionsStr) : []

  return customQuestions.some(
    (item: { categoryId: string; practice: Practice }) =>
      item.categoryId === categoryId && item.practice.id === practiceId,
  )
}
