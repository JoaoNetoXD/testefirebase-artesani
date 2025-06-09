
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DollarSign, Package, ShoppingBag, Users, ListOrdered, PackageSearch, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Receita Total (Simulada)", value: "R$ 12.345,67", icon: DollarSign, iconClass: "text-primary", link: "/admin/reports" },
    { title: "Pedidos Pendentes (Simulado)", value: "15", icon: ShoppingBag, iconClass: "text-accent", link: "/admin/orders" },
    { title: "Total de Produtos (Simulado)", value: "234", icon: Package, iconClass: "text-secondary", link: "/admin/products" },
    { title: "Novos Clientes (Mês) (Simulado)", value: "42", icon: Users, iconClass: "text-primary", link: "/admin/customers" }, 
  ];

  // Mock data for recent orders and low stock products
  const recentOrders = [
    { id: "ORD001", customer: "João Silva", total: 125.50, status: "Processando" },
    { id: "ORD002", customer: "Maria Oliveira", total: 78.90, status: "Pendente" },
    { id: "ORD003", customer: "Carlos Pereira", total: 210.00, status: "Enviado" },
  ];

  const lowStockProducts = [
    { id: "PROD004", name: "Shampoo Antiqueda", stock: 5, image: "https://placehold.co/40x40.png" },
    { id: "PROD002", name: "Creme Hidratante", stock: 8, image: "https://placehold.co/40x40.png" },
  ];

  return (
    <div className="overflow-x-hidden">
      <h1 className="text-3xl font-headline mb-8 animate-fade-in-up">Dashboard Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground/80">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.iconClass}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <Link href={stat.link || "#"} className="text-xs text-muted-foreground hover:text-primary flex items-center mt-1">
                Ver mais <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-headline flex items-center">
                <ListOrdered className="mr-3 h-6 w-6 text-primary" />
                Pedidos Recentes (Simulado)
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
                <Link href="/admin/orders">Ver Todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.slice(0,3).map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="text-right">R$ {order.total.toFixed(2).replace('.',',')}</TableCell>
                      <TableCell className="text-center"><Badge variant={order.status === "Enviado" ? "secondary" : "outline"}>{order.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="min-h-[150px] flex flex-col items-center justify-center">
                <ListOrdered className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum pedido recente para exibir.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-headline flex items-center">
                <PackageSearch className="mr-3 h-6 w-6 text-primary" />
                Produtos com Baixo Estoque (Simulado)
            </CardTitle>
             <Button variant="outline" size="sm" asChild>
                <Link href="/admin/inventory">Ver Estoque</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <ul className="space-y-3">
                {lowStockProducts.slice(0,3).map(product => (
                  <li key={product.id} className="flex items-center justify-between p-2 bg-card-foreground/5 rounded-md">
                    <div className="flex items-center gap-3">
                       <img src={product.image} alt={product.name} className="w-8 h-8 rounded object-cover" data-ai-hint="product thumbnail" />
                       <span>{product.name}</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">Estoque: {product.stock}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="min-h-[150px] flex flex-col items-center justify-center">
                <PackageSearch className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum produto com baixo estoque.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
