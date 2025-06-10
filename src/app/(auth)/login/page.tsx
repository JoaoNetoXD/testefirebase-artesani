
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, loading, currentUser, isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get('redirect') || '/';
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (currentUser && !loading) {
      // Se tem redirect para admin, verificar se é admin
      if (redirectTo === '/admin' && isAdmin) {
        router.push('/admin');
      } else if (redirectTo !== '/admin') {
        router.push(redirectTo);
      } else if (redirectTo === '/admin' && !isAdmin) {
        router.push('/'); // Redirecionar para home se não for admin
      }
    }
  }, [currentUser, isAdmin, loading, redirectTo, router]);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    console.log('🔐 Tentando fazer login...');
    console.log('📍 Redirect para:', redirectTo);
    
    const success = await login(data.email, data.password);
    
    if (success) {
      console.log('✅ Login bem-sucedido, redirecionando para:', redirectTo);
      // O redirecionamento será feito pelo useEffect acima
    }
  };

  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-headline">Bem-vindo de volta!</CardTitle>
        <CardDescription>
          Entre com seus dados para acessar sua conta.
          {redirectTo === '/admin' && (
            <span className="block mt-2 text-sm text-blue-600 font-medium">
              🔒 Acesso ao Painel Administrativo
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link href="/forgot-password" prefetch={false} className="text-sm text-primary hover:underline">
                Esqueceu sua senha?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="Sua senha" {...register("password")} />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar'}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link href="/register" prefetch={false} className="font-medium text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
