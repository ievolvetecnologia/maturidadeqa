export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SQM Assessment. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
