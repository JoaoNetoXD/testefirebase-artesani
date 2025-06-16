'use client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import Image from "next/legacy/image";
import { Target, Eye, Gem, BadgeCheck, ShieldCheck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
        'Ser reconhecida como farmácia de manipulação de referência em Teresina e região, destacando-nos pela qualidade, inovação e cuidado farmacêutico, expandindo nosso impacto positivo na comunidade.',
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

  const apiKey = "AIzaSyB1jXTA50ofpSx2ZVoyluUdrvboAIJYD5Q";
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?q=Rua%207%20de%20Setembro%2C%20226%2C%20Centro%20Sul%2C%20Teresina%20-%20PI&zoom=17&key=${apiKey}`;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow mb-20 md:mb-0">
        <section className="py-12 md:py-16 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container mx-auto px-4 text-center animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary mb-4">
              Farmácia Artesani: Cuidando de Você em Teresina
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
              Descubra como unimos tradição, inovação e um cuidado farmacêutico excepcional para promover sua saúde e bem-estar.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center md:text-left animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h2 className="text-3xl font-headline font-semibold text-primary mb-6">
                Tradição e Inovação em Manipulados em Teresina
              </h2>
              <div className="space-y-4 text-foreground/90 text-base md:text-lg leading-relaxed">
                <p>
                  Bem-vindo à Farmácia Artesani! Com uma herança de excelência e confiança, estamos orgulhosamente presentes em Teresina há anos, combinando profunda tradição farmacêutica com as mais modernas tecnologias para cuidar da sua saúde de forma única e personalizada.
                </p>
                <p>
                  Nossa unidade em Teresina é um espaço dedicado integralmente ao seu bem-estar. Aqui, cada detalhe, desde a rigorosa seleção de ativos até a manipulação precisa em nossos laboratórios de ponta, é pensado para oferecer o máximo em segurança e eficácia, sempre inovando em manipulados.
                </p>
                <p>
                  Acreditamos que a saúde é uma jornada individual e que o cuidado farmacêutico de qualidade faz toda a diferença. Por isso, nosso compromisso vai além da simples manipulação de fórmulas: é sobre entender profundamente suas necessidades, oferecer orientação especializada e construir uma relação de confiança e parceria com cada cliente. Conte com a Farmácia Artesani Teresina para ser sua aliada em busca de uma vida mais saudável e plena.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Seção do farmacêutico com as melhorias que você gostou */}
        <section className="py-12 md:py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-stretch">
              <div 
                className="relative order-last md:order-first animate-fade-in-left flex flex-col justify-center" 
                style={{ animationDelay: '300ms' }}
              >
                <div className="relative w-full h-full min-h-[400px] md:min-h-[500px] group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
                  <Image
                    src="https://i.imgur.com/Z9NogEk.png" 
                    alt="Dr. Guilherme Xavier - Farmacêutico Responsável na Farmácia Artesani Teresina"
                    fill
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 600px"
                    className="object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500 relative z-10"
                    data-ai-hint="pharmacist portrait professional" 
                  />
                   <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-accent to-secondary text-white p-4 rounded-full shadow-2xl group-hover:scale-110 transition-transform z-20">
                     <ShieldCheck size={40} />
                   </div>
                   <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground z-20">
                     👨‍⚕️ Farmacêutico Responsável
                   </Badge>
                </div>
              </div>
              <div className="animate-fade-in-right flex flex-col justify-center" style={{ animationDelay: '500ms' }}>
                <h2 className="text-4xl font-headline font-semibold text-foreground mb-3"> 
                  Cuidado Farmacêutico de Confiança
                </h2>
                <p className="text-xl text-foreground/70 mb-6">
                  Dr. Guilherme Xavier, Farmacêutico Responsável
                </p>
                <div className="space-y-4 text-foreground/90 text-base md:text-lg leading-relaxed">
                  <p>
                    Com paixão pela ciência farmacêutica e um compromisso genuíno com o bem-estar dos pacientes, Dr. Guilherme Xavier lidera nossa equipe em Teresina. Sua vasta experiência em manipulação magistral garante que cada fórmula seja preparada com precisão, segurança e a máxima qualidade que você merece.
                  </p>
                  <p>
                    Dr. Guilherme acredita no atendimento humanizado e na importância de ouvir cada cliente para oferecer soluções verdadeiramente personalizadas. Ele supervisiona de perto todos os processos, desde a seleção rigorosa de matérias-primas até a entrega do seu medicamento, assegurando que você receba o melhor cuidado possível em cada etapa.
                  </p>
                  <blockquote className="border-l-4 border-accent pl-4 italic text-foreground/80 my-4">
                    &quot;Minha missão é combinar o conhecimento técnico com a atenção individualizada, proporcionando tratamentos eficazes e seguros para a comunidade de Teresina, sempre com o padrão de qualidade Artesani.&quot;
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-semibold text-primary mb-10 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>Nossos Pilares</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {pilares.map((pilar, index) => (
                <div
                  key={pilar.title}
                  className="bg-card text-card-foreground p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 flex flex-col items-center text-center transform hover:-translate-y-1 animate-fade-in-up h-full" 
                  style={{ animationDelay: `${600 + index * 150}ms` }}
                >
                  <pilar.icon className="h-12 w-12 text-accent mb-5" />
                  <h3 className="text-xl font-headline font-semibold text-card-foreground mb-2">{pilar.title}</h3>
                  <p className="text-sm text-card-foreground/80 flex-grow">{pilar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
          
        <section className="py-12 md:py-16 bg-primary/5">
          <div className="container mx-auto px-4 animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
            <h3 className="text-3xl font-headline font-semibold text-primary mb-6 text-center flex items-center justify-center">
                <MapPin className="mr-3 h-8 w-8 text-primary" />
                Visite-nos em Teresina!
            </h3>
            <p className="text-foreground/80 mb-8 max-w-xl mx-auto text-center">
                Estamos localizados na Rua 7 de Setembro, N° 226, Centro Sul. Venha nos conhecer e descubra como podemos cuidar da sua saúde com a qualidade e confiança que só a Artesani oferece!
            </p>
            <div className="aspect-video md:aspect-[16/6] lg:aspect-[16/5] rounded-xl overflow-hidden shadow-2xl border border-border">
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Farmácia Artesani em Teresina"
              ></iframe>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
