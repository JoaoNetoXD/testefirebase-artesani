
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-headline">Bem-vindo de volta!</CardTitle>
        <CardDescription>Entre com seus dados para acessar sua conta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="seu@email.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link href="/forgot-password" prefetch={false} className="text-sm text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="Sua senha" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Entrar</Button>
        <div className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <Link href="/register" prefetch={false} className="font-medium text-primary hover:underline">
            Cadastre-se
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
