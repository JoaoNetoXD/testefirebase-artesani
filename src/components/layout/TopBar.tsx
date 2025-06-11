
import { Instagram, MapPin } from 'lucide-react';
import Link from 'next/link';

// Componente para o ícone do WhatsApp
const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    // Removida a classe de cor específica para herdar a cor do pai
  >
    <path
      d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.452-4.437-9.887-9.888-9.888-5.452 0-9.887 4.434-9.889 9.888-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.508-.182-.008-.381-.008-.579-.008-.198 0-.522.074-.795.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.122.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413z"
    />
  </svg>
);

export function TopBar() {
  const whatsappLink = `https://wa.me/558632218576?text=${encodeURIComponent('Olá! Vim pelo site da Artesani e gostaria de mais informações.')}`;

  return (
    <div className="bg-primary/90 text-primary-foreground/80 py-1.5 px-4 md:px-6 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between md:justify-between text-xs font-medium flex-wrap gap-y-1.5">
        {/* Lado Esquerdo: WhatsApp */}
        <Link href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-secondary transition-colors">
          <WhatsAppIcon />
          <span>(86) 3221-8576</span>
        </Link>
        
        {/* Meio: Instagram */}
        <Link href="https://www.instagram.com/artesanipiaui/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-secondary transition-colors">
          <Instagram size={14} />
          <span>@artesanipiaui</span>
        </Link>

        {/* Lado Direito: Localização */}
        <Link href="https://maps.app.goo.gl/JZ93cSdjWaX3RsbA9" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-secondary transition-colors">
          <MapPin size={14} />
          <span>Teresina-PI</span>
        </Link>
      </div>
    </div>
  );
}
