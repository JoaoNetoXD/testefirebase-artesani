
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingBag, Users, ListOrdered, PackageSearch } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Receita Total (Simulada)", value: "R$ 12,345.67", icon: DollarSign, iconClass: "text-primary" },
    { title: "Pedidos Pendentes (Simulado)", value: "15", icon: ShoppingBag, iconClass: "text-accent" },
    { title: "Total de Produtos (Simulado)", value: "234", icon: Package, iconClass: "text-secondary" },
    { title: "Novos Clientes (Mês) (Simulado)", value: "42", icon: Users, iconClass: "text-green-600" }, // Mantendo uma cor específica para variedade se desejado
  ];

  return (
    <div>
      <h1 className="text-3xl font-headline mb-8">Dashboard Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium text-card-foreground/80">{stat.title}</CardTitle>
              <stat.icon className={`h-6 w-6 ${stat.iconClass}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-card-foreground">{stat.value}</div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
                <ListOrdered className="mr-3 h-6 w-6 text-primary" />
                Pedidos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[200px] flex flex-col items-center justify-center">
            <ListOrdered className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum pedido recente para exibir.</p>
            <p className="text-xs text-muted-foreground mt-1">(Funcionalidade a ser implementada)</p>
          </CardContent>
        </Card>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center">
                <PackageSearch className="mr-3 h-6 w-6 text-primary" />
                Produtos com Baixo Estoque
            </CardTitle>
          </CardHeader>
          <CardContent className="min-h-[200px] flex flex-col items-center justify-center">
            <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum produto com baixo estoque no momento.</p>
             <p className="text-xs text-muted-foreground mt-1">(Funcionalidade a ser implementada)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
