
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  return (
    <Card className="shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-headline">Recuperar Senha</CardTitle>
        <CardDescription>Digite seu email para receber instruções de como redefinir sua senha.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="seu@email.com" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Enviar Email de Recuperação</Button>
        <div className="text-center text-sm text-muted-foreground">
          Lembrou sua senha?{' '}
          <Link href="/login" prefetch={false} className="font-medium text-primary hover:underline">
            Faça login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
