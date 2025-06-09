
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

export default function AccountOverviewPage() {
  // Mock data - ideally fetched from a real source
  const recentOrder = { 
    id: "ORD001", 
    date: "2024-07-15", 
    total: 125.50, 
    status: "Entregue",
    items: [
      { id: "p1", name: "Analgésico Potente", quantity: 2, price: 25.99, imageUrl: "https://placehold.co/80x80.png" },
      { id: "p2", name: "Vitamina C Efervescente", quantity: 1, price: 32.50, imageUrl: "https://placehold.co/80x80.png" },
    ]
  }; // Example recent order
  const userProfile = {
    name: "Usuário Teste",
    email: "usuario@teste.com"
  };

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Visão Geral da Conta</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Último Pedido</CardTitle>
          </CardHeader>
          {recentOrder ? (
            <>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Pedido #{recentOrder.id} - Data: {recentOrder.date}</p>
                <ul className="space-y-2">
                  {recentOrder.items.slice(0, 2).map(item => ( // Show first 2 items
                    <li key={item.id} className="flex items-center gap-3 text-sm">
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        width={40} 
                        height={40} 
                        className="rounded-md object-cover border border-border"
                        data-ai-hint="product icon"
                      />
                      <span className="text-card-foreground">{item.name} (x{item.quantity})</span>
                    </li>
                  ))}
                  {recentOrder.items.length > 2 && <li className="text-xs text-muted-foreground">... e mais {recentOrder.items.length - 2} itens</li>}
                </ul>
                <Separator />
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-card-foreground">Total: R$ {recentOrder.total.toFixed(2).replace('.',',')}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${recentOrder.status === 'Entregue' ? 'bg-green-600 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {recentOrder.status}
                    </span>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/account/orders" className="w-full">
                  <Button variant="outline" className="w-full text-primary hover:bg-primary/10 hover:text-primary border-primary">Ver todos os pedidos</Button>
                </Link>
              </CardFooter>
            </>
          ) : (
            <CardContent>
              <p className="text-muted-foreground">Você não tem pedidos recentes.</p>
              <Link href="/category/manipulados" className="mt-4 inline-block">
                 <Button variant="link" className="text-accent p-0">Comece a comprar</Button>
              </Link>
            </CardContent>
          )}
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Informações do Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-card-foreground"><span className="font-medium">Nome:</span> {userProfile.name}</p>
            <p className="text-card-foreground"><span className="font-medium">Email:</span> {userProfile.email}</p>
            {/* Add more profile details here if needed */}
          </CardContent>
          <CardFooter>
            <Link href="/account/profile" className="w-full">
              <Button variant="outline" className="w-full text-primary hover:bg-primary/10 hover:text-primary border-primary">Editar Perfil</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
