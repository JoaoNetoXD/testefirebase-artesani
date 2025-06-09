
export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="font-headline text-lg">Artesani Pharmacy</p>
        <p className="text-sm mt-2">&copy; {currentYear} Artesani Pharmacy. Todos os direitos reservados.</p>
        <div className="mt-4 space-x-4">
          <a href="#" className="hover:underline">Política de Privacidade</a>
          <a href="#" className="hover:underline">Termos de Serviço</a>
          <a href="#" className="hover:underline">Contato</a>
        </div>
      </div>
    </footer>
  );
}
