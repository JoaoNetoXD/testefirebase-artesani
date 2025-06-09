import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/CartContext';
import { Inter } from 'next/font/google'; // Import next/font

// Configure Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Expose as CSS variable
  display: 'swap',         // Good for performance and avoiding FOUT/FOIT
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
    // Apply the font variable to the html tag
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/* Google Font <link> tags previously here are now removed */}
      </head>
      <body className="font-body antialiased">
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
