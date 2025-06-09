
export function Footer() {
  const currentYear = new Date().getFullYear();
  const apiKey = "AIzaSyB1jXTA50ofpSx2ZVoyluUdrvboAIJYD5Q"; // Sua chave de API aqui
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?q=Rua%207%20de%20Setembro%2C%20226%2C%20Centro%20Sul%2C%20Teresina%20-%20PI&zoom=16&key=${apiKey}`;

  return (
    <footer className="bg-primary text-primary-foreground py-10 mt-16 border-t-4 border-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-headline font-semibold mb-3">Farmácia Artesani</h3>
            <p className="text-sm text-primary-foreground/80">Sua saúde em boas mãos, com qualidade e confiança em Teresina-PI.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Links Úteis</h4>
            <ul className="space-y-1.5 text-sm">
              <li><a href="/sobre-nos" className="hover:text-secondary transition-colors">Sobre Nós</a></li> 
              <li><a href="/category/manipulados" className="hover:text-secondary transition-colors">Catálogo</a></li>
              <li><a href="/account" className="hover:text-secondary transition-colors">Minha Conta</a></li>
              <li><a href="/#contato" className="hover:text-secondary transition-colors">Contato</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Atendimento</h4>
            <ul className="space-y-1.5 text-sm text-primary-foreground/80">
              <li>(86) 3221-8576</li>
              <li>artesani.marketplace@gmail.com</li>
              <li>Seg-Sex: 9h às 18h</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Nossa Localização e Dados</h4>
            <div className="mt-1 rounded-lg overflow-hidden shadow-md border border-primary-foreground/20 h-[180px] md:h-[200px]">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Farmácia Artesani Teresina - Rodapé"
              ></iframe>
            </div>
            <div className="text-sm text-primary-foreground/80 not-italic space-y-1 mt-3 text-center">
              <p>CNPJ: 08.306.438/0001-04</p>
              <p>PHARMA MANIPULAÇÃO LTDA.</p>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-primary-foreground/70 mt-10 pt-6 border-t border-primary-foreground/20">
          <p>&copy; {currentYear} Farmácia Artesani (PHARMA MANIPULAÇÃO LTDA.). Todos os direitos reservados.</p>
          <div className="mt-2 space-x-3">
            <a href="#" className="hover:underline">Política de Privacidade</a>
            <a href="#" className="hover:underline">Termos de Serviço</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
