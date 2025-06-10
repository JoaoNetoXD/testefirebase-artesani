
'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Loader2 } from 'lucide-react'; // Importar Loader2

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de autenticação
    console.log('Login attempt:', { email, password });
    
    setTimeout(() => {
      setIsLoading(false);
      // Redirecionar após login bem-sucedido
      // Idealmente, o AuthContext faria o redirecionamento após o login bem-sucedido
      window.location.href = '/'; 
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="p-6 sm:p-8 text-center">
          <CardTitle className="text-3xl font-headline text-card-foreground">
            Entrar na sua conta
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 text-base"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-11 text-base" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-card-foreground/80">Não tem uma conta? </span>
            <Link href="/register" className="font-semibold text-accent hover:text-accent/90 hover:underline">
              Criar conta
            </Link>
          </div>
          
          <div className="mt-3 text-center text-sm">
            <Link href="/forgot-password" className="font-medium text-card-foreground/80 hover:text-accent hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
