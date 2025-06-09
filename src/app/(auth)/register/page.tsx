
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-headline">Crie sua Conta</CardTitle>
        <CardDescription>É rápido e fácil. Comece a comprar agora!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome Completo</Label>
          <Input id="name" placeholder="Seu nome completo" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="seu@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" type="tel" placeholder="(XX) XXXXX-XXXX" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" placeholder="Crie uma senha forte" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Senha</Label>
          <Input id="confirm-password" type="password" placeholder="Confirme sua senha" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Cadastrar</Button>
        <div className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link href="/login" prefetch={false} className="font-medium text-primary hover:underline">
            Faça login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
