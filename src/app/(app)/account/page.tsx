
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountOverviewPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Visão Geral da Conta</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Você não tem pedidos recentes.</p>
            <Link href="/account/orders" className="mt-4 inline-block">
              <Button variant="link" className="text-primary p-0">Ver todos os pedidos</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-1">Nome: Usuário Teste</p>
            <p className="text-muted-foreground mb-4">Email: usuario@teste.com</p>
            <Link href="/account/profile">
              <Button variant="outline">Editar Perfil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
