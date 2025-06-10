
'use client';
import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Adicionado useRouter
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Importar useAuth
import { useToast } from '@/hooks/use-toast'; // Importar useToast

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter(); // Usar useRouter de next/navigation
  const { login, loading: authLoading } = useAuth(); // Usar login do AuthContext
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Usar authLoading do AuthContext em vez de um isLoading local para o estado de submissão
  // const [isLoading, setIsLoading] = useState(false); // Remover isLoading local se authLoading for suficiente

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Remover as linhas comentadas e definições duplicadas
    // Manter apenas uma definição da variável
    const intendedRedirectPath = searchParams.get('redirect');
    console.log("Login page: Intended redirect path from URL:", intendedRedirectPath);

    const { success, isAdminUser } = await login(email, password);
    
    if (success) {
      console.log("Login page: Login successful. isAdminUser:", isAdminUser);
      if (intendedRedirectPath) {
        if (intendedRedirectPath === '/admin' && isAdminUser) {
          console.log("Login page: Redirecting to /admin (intended and admin).");
          router.push('/admin');
        } else if (intendedRedirectPath === '/admin' && !isAdminUser) {
          console.log("Login page: Attempted /admin redirect by non-admin. Redirecting to /.");
          toast({ title: "Acesso Negado", description: "Você não tem permissão para acessar o painel de administração.", variant: "destructive" });
          router.push('/');
        } else if (intendedRedirectPath !== '/admin') {
          console.log("Login page: Redirecting to intended path:", intendedRedirectPath);
          router.push(intendedRedirectPath);
        } else {
          // Fallback: deveria ser coberto pelos casos acima, mas por segurança
          console.log("Login page: Fallback redirect logic. isAdminUser:", isAdminUser, "Redirecting to", isAdminUser ? '/admin' : '/');
          router.push(isAdminUser ? '/admin' : '/');
        }
      } else {
        // No specific redirect in URL, default behavior
        console.log("Login page: No intended redirect path. isAdminUser:", isAdminUser, "Redirecting to", isAdminUser ? '/admin' : '/');
        router.push(isAdminUser ? '/admin' : '/');
      }
    } else {
      console.log("Login page: Login failed.");
      // Toast de erro já é tratado dentro da função login do AuthContext
    }
    // setIsLoading(false); // Se estiver usando authLoading, esta linha pode não ser necessária
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
              disabled={authLoading} // Usar authLoading do context
            >
              {authLoading ? <Loader2 className="animate-spin" /> : 'Entrar'}
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
