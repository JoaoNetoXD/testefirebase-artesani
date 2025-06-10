
"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { OrderService } from '@/lib/services/orderService';
import { ProductService } from '@/lib/services/productService';
import { CustomerService } from '@/lib/services/customerService';
import { InventoryService } from '@/lib/services/inventoryService';
import type { Order, Product, Customer } from '@/lib/types';
import Image from 'next/image';

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
    try {
      // Carregar estatísticas
      const [orders, products, customers, lowStock] = await Promise.all([
        OrderService.getAllOrders(),
        ProductService.getAllProducts(),
        CustomerService.getAllCustomers(),
        InventoryService.getLowStockProducts(10)
      ]);

      // Calcular estatísticas
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const currentMonth = new Date().getMonth();
      const newCustomers = customers.filter(customer => {
        const joinedMonth = new Date(customer.joined).getMonth();
        return joinedMonth === currentMonth;
      }).length;

      setStats({
        totalRevenue,
        pendingOrders,
        totalProducts: products.length,
        newCustomers
      });

      setRecentOrders(orders.slice(0, 5));
      setLowStockProducts(lowStock.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { title: "Receita Total", value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, iconClass: "text-primary", link: "/admin/reports" },
    { title: "Pedidos Pendentes", value: stats.pendingOrders.toString(), icon: ShoppingBag, iconClass: "text-accent", link: "/admin/orders" },
    { title: "Total de Produtos", value: stats.totalProducts.toString(), icon: Package, iconClass: "text-secondary", link: "/admin/products" },
    { title: "Novos Clientes (Mês)", value: stats.newCustomers.toString(), icon: Users, iconClass: "text-primary", link: "/admin/customers" }, 
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      <h1 className="text-3xl font-headline mb-8 animate-fade-in-up">Dashboard Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Link key={index} href={stat.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <IconComponent className={`h-4 w-4 ${stat.iconClass}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pedidos Recentes */}
        <Card className="animate-fade-in-up animation-delay-400">
          <CardHeader>
            <CardTitle>Pedidos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name || 'Cliente'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {order.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/orders">Ver Todos os Pedidos</Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhum pedido encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* Produtos com Estoque Baixo */}
        <Card className="animate-fade-in-up animation-delay-500">
          <CardHeader>
            <CardTitle>Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Image
                      src={product.images[0] || '/placeholder-product.png'}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-destructive">Estoque: {product.stock}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/inventory">Gerenciar Estoque</Link>
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Todos os produtos têm estoque adequado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
