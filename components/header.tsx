import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { ClipboardList, Menu, Shield } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white">SQ</div>
          <span className="gradient-heading font-extrabold">SQM Assessment</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Início
          </Link>
          <Link href="/assessment" className="text-sm font-medium hover:text-primary transition-colors">
            Nova Avaliação
          </Link>
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/action-plans" className="text-sm font-medium hover:text-primary transition-colors">
            Planos de Ação
          </Link>
          <Link href="/history" className="text-sm font-medium hover:text-primary transition-colors">
            Histórico
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link href="/admin/login" className="hidden md:block">
            <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/50">
              <Shield className="h-4 w-4 mr-2" />
              Área Admin
            </Button>
          </Link>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="gradient-heading">SQM Assessment</SheetTitle>
                  <SheetDescription>Avaliação de Maturidade de Qualidade de Software</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                    Início
                  </Link>
                  <Link href="/assessment" className="text-sm font-medium hover:text-primary transition-colors">
                    Nova Avaliação
                  </Link>
                  <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                  <Link
                    href="/action-plans"
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Planos de Ação
                  </Link>
                  <Link href="/history" className="text-sm font-medium hover:text-primary transition-colors">
                    Histórico
                  </Link>
                  <Link href="/admin/login" className="mt-4">
                    <Button className="w-full flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Área Admin
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
