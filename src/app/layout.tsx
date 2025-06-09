
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Artesani Pharmacy Online',
  description: 'Sua farmácia de manipulação online.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark`}>
      <head />
      <body className="font-body antialiased bg-background text-foreground">
        <AuthProvider> {/* Wrap with AuthProvider */}
          <CartProvider>
            <FavoritesProvider>
              {children}
              <Toaster />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

