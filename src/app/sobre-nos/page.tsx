
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import Image from 'next/image';
import { Target, Eye, Gem, BadgeCheck, Users, Building } from 'lucide-react';

export default function SobreNosPage() {
  const pilares = [
    {
      icon: Target,
      title: 'Nossa Missão',
      description:
        'Oferecer soluções em saúde e bem-estar através de medicamentos e produtos manipulados com excelência, tecnologia e atendimento humanizado, buscando sempre a satisfação e confiança de nossos clientes em Teresina.',
    },
    {
      icon: Eye,
      title: 'Nossa Visão',
      description:
        'Ser reconhecida como a principal farmácia de manipulação em Teresina e região, referência em qualidade, inovação e cuidado farmacêutico, expandindo nossa presença e impacto positivo na comunidade.',
    },
    {
      icon: Gem,
      title: 'Nossos Valores',
      description:
        'Ética, Qualidade, Inovação, Confiança, Respeito, Humanização e Compromisso com a saúde e bem-estar dos nossos clientes.',
    },
    {
      icon: BadgeCheck,
      title: 'Nossa Política de Qualidade',
      description:
        'Assegurar a qualidade dos produtos e serviços, cumprindo as Boas Práticas de Manipulação, buscando a melhoria contínua dos processos e a capacitação dos colaboradores, para atender as necessidades e expectativas dos clientes e demais partes interessadas.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 mb-20 md:mb-0">
        <section className="py-12 md:py-16 animate-fade-in-up">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary mb-4">
              Sobre a Farmácia Artesani Teresina
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
              Sua saúde e bem-estar são a nossa prioridade. Conheça mais sobre nossa história e compromisso com Teresina.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h2 className="text-3xl font-headline font-semibold text-foreground mb-6">Quem Somos</h2>
              <div className="space-y-4 text-foreground/90 text-base md:text-lg leading-relaxed">
                <p>
                  Bem-vindo à Farmácia Artesani em Teresina! Somos uma unidade orgulhosa da renomada rede Artesani, trazendo para a capital piauiense toda a tradição, qualidade e inovação que marcam nossa trajetória desde 1989.
                  Com uma equipe de farmacêuticos altamente qualificados e apaixonados pelo que fazem, oferecemos um atendimento personalizado e soluções individualizadas para suas necessidades de saúde e bem-estar.
                </p>
                <p>
                  Nossa estrutura em Teresina foi cuidadosamente planejada para seguir os mais rigorosos padrões de qualidade, com laboratórios modernos e equipados para a manipulação de medicamentos, cosméticos e suplementos.
                  Acreditamos que cada cliente é único, e por isso, dedicamos nosso conhecimento e tecnologia para formular produtos que realmente façam a diferença na sua vida.
                </p>
                <p>
                  A confiança depositada em nós pela comunidade de Teresina é o nosso maior incentivo. Estamos comprometidos em ser mais do que uma farmácia: queremos ser seu parceiro de confiança na jornada por uma vida mais saudável e plena.
                </p>
              </div>
            </div>
            <div className="relative aspect-video w-full h-64 md:h-auto rounded-lg overflow-hidden shadow-xl animate-fade-in-up" style={{ animationDelay: '400ms' }} data-ai-hint="pharmacy team">
              <Image
                src="https://placehold.co/600x400.png" 
                alt="Equipe Farmácia Artesani Teresina"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-headline font-semibold text-foreground mb-8 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>Nossos Pilares</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pilares.map((pilar, index) => (
                <div
                  key={pilar.title}
                  className="bg-card text-card-foreground p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300 flex flex-col items-center text-center animate-fade-in-up"
                  style={{ animationDelay: `${600 + index * 150}ms` }}
                >
                  <pilar.icon className="h-12 w-12 text-accent mb-4" />
                  <h3 className="text-xl font-headline font-semibold text-primary mb-2">{pilar.title}</h3>
                  <p className="text-sm text-card-foreground/80 flex-grow">{pilar.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
            <h3 className="text-2xl font-headline font-semibold text-primary mb-3">Visite-nos em Teresina!</h3>
            <p className="text-foreground/80 mb-6 max-w-xl mx-auto">
                Estamos localizados na Rua 7 de Setembro, N° 226, Centro Sul. Venha nos conhecer e descubra como podemos cuidar da sua saúde!
            </p>
            {/* Pode adicionar um botão para o mapa ou mais informações de contato aqui */}
          </div>

        </section>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
