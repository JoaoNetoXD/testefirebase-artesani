
export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-primary text-primary-foreground py-10 mt-16 border-t-4 border-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-headline font-semibold mb-3">Farmácia Artesani</h3>
            <p className="text-sm text-primary-foreground/80">Sua saúde em boas mãos, com qualidade e confiança.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Links Úteis</h4>
            <ul className="space-y-1.5 text-sm">
              <li><a href="/#sobre" className="hover:text-secondary transition-colors">Sobre Nós</a></li>
              <li><a href="/category/manipulados" className="hover:text-secondary transition-colors">Catálogo</a></li>
              <li><a href="/account" className="hover:text-secondary transition-colors">Minha Conta</a></li>
              <li><a href="/#contato" className="hover:text-secondary transition-colors">Contato</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Atendimento</h4>
            <ul className="space-y-1.5 text-sm text-primary-foreground/80">
              <li>(11) 9999-9999</li>
              <li>contato@artesani.com.br</li>
              <li>Seg-Sex: 9h às 18h</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-primary-foreground/70 mt-10 pt-6 border-t border-primary-foreground/20">
          <p>&copy; {currentYear} Artesani Pharmacy. Todos os direitos reservados.</p>
          <div className="mt-2 space-x-3">
            <a href="#" className="hover:underline">Política de Privacidade</a>
            <a href="#" className="hover:underline">Termos de Serviço</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
