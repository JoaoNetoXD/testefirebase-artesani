
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ShoppingBag, Package, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { OrderService } from '@/lib/services/orderService';
import { ProductService } from '@/lib/services/productService';
import { CustomerService } from '@/lib/services/customerService';
import { InventoryService } from '@/lib/services/inventoryService';
import type { Order, Product } from '@/lib/types';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    totalProducts: 0,
    newCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [orders, products, customers, lowStock] = await Promise.all([
        OrderService.getAllOrders(),
        ProductService.getAllProducts(),
        CustomerService.getAllCustomers(),
        InventoryService.getLowStockProducts(5) // Get top 5 low stock products
      ]);

      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
      const currentMonth = new Date().getMonth();
      const newCustomers = customers.filter(customer => {
        if (!customer.joined) return false;
        const joinedMonth = new Date(customer.joined).getMonth();
        return joinedMonth === currentMonth;
      }).length;

      setStats({
        totalRevenue,
        pendingOrders,
        totalProducts: products.length,
        newCustomers
      });

      setRecentOrders(orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5));
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Here you could set an error state and display a toast or a message
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: "Receita Total", value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-primary" },
    { title: "Pedidos Pendentes", value: stats.pendingOrders.toString(), icon: ShoppingBag, color: "text-accent" },
    { title: "Total de Produtos", value: stats.totalProducts.toString(), icon: Package, color: "text-secondary" },
    { title: "Novos Clientes (Mês)", value: stats.newCustomers.toString(), icon: Users, color: "text-primary" },
  ];

  const StatCardSkeleton = () => (
    <Card className="bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-1/2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-4xl font-headline font-bold text-foreground mb-2 animate-fade-in-up">Dashboard</h1>
      <p className="text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        Uma visão geral do seu e-commerce.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          statsCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="bg-card/50 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: `${index * 100 + 200}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="xl:col-span-2">
            <Card className="bg-card/50 border-border/50 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Últimos Pedidos</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/orders">
                            Ver todos <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recentOrders.length > 0 ? (
                        <div className="divide-y divide-border/50">
                            {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                                <div>
                                <p className="font-semibold text-foreground">{order.customer_name || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">ID: {order.id}</p>
                                </div>
                                <div className="text-right">
                                <p className="font-medium text-foreground">R$ {order.total.toFixed(2)}</p>
                                <p className={`text-sm font-semibold ${order.status === 'pending' ? 'text-accent' : order.status === 'completed' ? 'text-green-400' : 'text-muted-foreground'}`}>
                                    {order.status}
                                </p>
                                </div>
                            </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Nenhum pedido recente encontrado.</p>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Low Stock Products */}
        <div>
            <Card className="bg-card/50 border-border/50 animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Estoque Baixo</CardTitle>
                     <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/inventory">
                            Ver tudo <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                     {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center space-x-3 p-2">
                                    <Skeleton className="h-10 w-10 rounded-md" />
                                    <div className="flex-1 space-y-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : lowStockProducts.length > 0 ? (
                        <div className="divide-y divide-border/50">
                            {lowStockProducts.map((product) => (
                            <div key={product.id} className="flex items-center space-x-3 p-3 hover:bg-muted/50 transition-colors">
                                <Image
                                src={product.images[0] || '/placeholder-product.png'}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="rounded-md object-cover border border-border/50"
                                />
                                <div className="flex-1">
                                <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
                                <p className="text-xs text-destructive font-bold">Restam: {product.stock}</p>
                                </div>
                                 <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/products/edit/${product.slug}`}>
                                        Editar
                                    </Link>
                                </Button>
                            </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">Nenhum produto com estoque baixo.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
