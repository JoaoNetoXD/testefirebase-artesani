import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { AuthProvider } from '@/context/AuthContext';
import { Inter } from 'next/font/google';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { AccessibilityProvider, SkipToContentButton } from '@/components/shared/AccessibilityProvider';
import { ServiceWorkerProvider } from '@/components/shared/ServiceWorkerProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Farmácia Artesani Online | Manipulados em Teresina-PI',
  description: 'Sua farmácia de manipulação online em Teresina-PI. Qualidade e confiança para sua saúde.',
  keywords: 'farmácia, manipulação, Teresina, PI, medicamentos, cosméticos, suplementos, artesani',
  authors: [{ name: 'Farmácia Artesani' }],
  creator: 'Farmácia Artesani',
  publisher: 'Farmácia Artesani',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://artesani.com',
    siteName: 'Farmácia Artesani',
    title: 'Farmácia Artesani Online | Manipulados em Teresina-PI',
    description: 'Sua farmácia de manipulação online em Teresina-PI. Qualidade e confiança para sua saúde.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Farmácia Artesani - Manipulados em Teresina-PI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Farmácia Artesani Online | Manipulados em Teresina-PI',
    description: 'Sua farmácia de manipulação online em Teresina-PI. Qualidade e confiança para sua saúde.',
    images: ['/images/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://artesani.com',
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a5f3f" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/icon-192x192.png" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <ErrorBoundary>
          <ServiceWorkerProvider>
            <AccessibilityProvider>
              <SkipToContentButton />
              <AuthProvider>
                <CartProvider>
                  <FavoritesProvider>
                    {children}
                    <Toaster />
                  </FavoritesProvider>
                </CartProvider>
              </AuthProvider>
            </AccessibilityProvider>
          </ServiceWorkerProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
