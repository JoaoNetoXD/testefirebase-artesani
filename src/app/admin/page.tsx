
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Receita Total", value: "R$ 12,345.67", icon: DollarSign, color: "text-green-500" },
    { title: "Pedidos Pendentes", value: "15", icon: ShoppingBag, color: "text-yellow-500" },
    { title: "Total de Produtos", value: "234", icon: Package, color: "text-blue-500" },
    { title: "Novos Clientes (Mês)", value: "42", icon: Users, color: "text-purple-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-headline mb-8">Dashboard Administrativo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent orders list */}
            <p className="text-muted-foreground">Nenhum pedido recente para exibir.</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Produtos com Baixo Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Placeholder for low stock products list */}
            <p className="text-muted-foreground">Nenhum produto com baixo estoque.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
