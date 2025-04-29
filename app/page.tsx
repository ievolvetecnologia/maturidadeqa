import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart2, CheckCircle, Code, FileText, Lock, Shield } from "lucide-react"
import ContactForm from "@/components/contact-form"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 -z-10 bg-gradient-radial from-primary/20 via-transparent to-transparent opacity-70 blur-3xl" />
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 gradient-heading animate-gradient-x">
            Avaliação de Maturidade de Qualidade de Software
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Avalie o nível de maturidade de qualidade de software das suas squads através de um questionário estruturado
            e visualize resultados em dashboards interativos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?redirect=/assessment">
              <Button size="lg" className="text-lg px-8 bg-gradient-primary hover:opacity-90 transition-opacity">
                Iniciar Avaliação
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login?redirect=/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 border-primary/20 hover:border-primary/50">
                Ver Dashboard
                <BarChart2 className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-10 text-center gradient-heading">Como funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="card-hover border-primary/10">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Questionário</CardTitle>
                <CardDescription>Responda perguntas estruturadas sobre práticas de qualidade</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Avalie cada prática com uma nota percentual de 0 a 100%, representando o nível de maturidade da sua
                  squad.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-primary/10">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <BarChart2 className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Análise</CardTitle>
                <CardDescription>Visualize resultados em dashboards interativos</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Obtenha insights visuais sobre o nível de maturidade da sua squad em diferentes categorias e práticas.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-primary/10">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Melhoria</CardTitle>
                <CardDescription>Identifique áreas para evolução contínua</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Utilize os resultados para criar planos de ação e melhorar continuamente a qualidade do software.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-10 text-center gradient-heading">Categorias Avaliadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Modelo Operacional",
                description: "Requisitos, estórias e ritos ágeis",
                icon: <FileText className="h-5 w-5" />,
              },
              {
                title: "Desenvolvimento",
                description: "Gestão de configuração e práticas de código",
                icon: <Code className="h-5 w-5" />,
              },
              {
                title: "Ambiente e Massa de Testes",
                description: "Infraestrutura e dados para testes",
                icon: <CheckCircle className="h-5 w-5" />,
              },
              {
                title: "Testes Funcionais",
                description: "Validação de funcionalidades e regressão",
                icon: <CheckCircle className="h-5 w-5" />,
              },
              {
                title: "Segurança",
                description: "Práticas de segurança e proteção de dados",
                icon: <Shield className="h-5 w-5" />,
              },
              {
                title: "Testes Não Funcionais",
                description: "Performance, carga e usabilidade",
                icon: <Lock className="h-5 w-5" />,
              },
            ].map((category, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-primary/10 bg-gradient-to-br from-white to-primary/5 dark:from-gray-900 dark:to-primary/10 card-hover"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 rounded-full bg-primary/10 text-primary">{category.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section with Contact Form */}
        <div className="rounded-2xl p-8 bg-gradient-primary text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-left">
              <h2 className="text-3xl font-bold mb-4">Pronto para avaliar sua squad?</h2>
              <p className="text-lg mb-8 opacity-90">
                Comece agora mesmo a avaliação de maturidade e descubra como melhorar a qualidade do seu software.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login?redirect=/assessment">
                  <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                    Iniciar Avaliação
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login?redirect=/dashboard">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    Ver Dashboard
                    <BarChart2 className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-semibold mb-4">Solicite uma demonstração</h3>
              <p className="text-sm mb-6">Preencha o formulário abaixo para falar com um de nossos consultores.</p>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
