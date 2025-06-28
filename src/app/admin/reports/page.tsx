"use client";
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  Download, 
  Calendar,
  Target,
  ShoppingCart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OrderService } from '@/lib/services/orderService';
import { ProductService } from '@/lib/services/productService';
import { CustomerService } from '@/lib/services/customerService';
import type { Order, Product, Customer } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRange } from 'react-day-picker';
import { addDays, subDays, startOfMonth, endOfMonth, format } from 'date-fns';

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{ product: Product; quantity: number; revenue: number }>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  customerStats: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
  };
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [reportType, setReportType] = useState<'sales' | 'products' | 'customers'>('sales');
  const { toast } = useToast();

  const generateReport = useCallback(async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Erro",
        description: "Selecione um período válido para o relatório.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const [orders, products, customers] = await Promise.all([
        OrderService.getAllOrders(),
        ProductService.getAllProducts(),
        CustomerService.getAllCustomers()
      ]);

      // Filtrar pedidos pelo período selecionado
      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= dateRange.from! && orderDate <= dateRange.to! && order.status !== 'cancelled';
      });

      // Calcular métricas
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = filteredOrders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Produtos mais vendidos
      const productSales: Record<string, { product: Product; quantity: number; revenue: number }> = {};
      
      filteredOrders.forEach(order => {
        order.order_items?.forEach(item => {
          const productId = item.product_id;
          if (!productSales[productId]) {
            const product = products.find(p => p.id === productId);
            if (product) {
              productSales[productId] = {
                product,
                quantity: 0,
                revenue: 0
              };
            }
          }
          if (productSales[productId]) {
            productSales[productId].quantity += item.quantity;
            productSales[productId].revenue += item.price * item.quantity;
          }
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      // Receita por dia
      const revenueByDay: Record<string, { revenue: number; orders: number }> = {};
      filteredOrders.forEach(order => {
        const dateKey = format(new Date(order.created_at), 'yyyy-MM-dd');
        if (!revenueByDay[dateKey]) {
          revenueByDay[dateKey] = { revenue: 0, orders: 0 };
        }
        revenueByDay[dateKey].revenue += order.total;
        revenueByDay[dateKey].orders += 1;
      });

      const revenueByDayArray = Object.entries(revenueByDay)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Estatísticas de clientes
      const newCustomers = customers.filter(customer => {
        const joinDate = new Date(customer.joined);
        return joinDate >= dateRange.from! && joinDate <= dateRange.to!;
      }).length;

      const returningCustomers = customers.filter(customer => customer.orders > 1).length;

      setReportData({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        revenueByDay: revenueByDayArray,
        customerStats: {
          totalCustomers: customers.length,
          newCustomers,
          returningCustomers
        }
      });

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange, toast]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  const exportReport = () => {
    if (!reportData) return;

    const data = {
      period: `${format(dateRange?.from!, 'dd/MM/yyyy')} - ${format(dateRange?.to!, 'dd/MM/yyyy')}`,
      summary: {
        totalRevenue: reportData.totalRevenue,
        totalOrders: reportData.totalOrders,
        averageOrderValue: reportData.averageOrderValue,
        ...reportData.customerStats
      },
      topProducts: reportData.topProducts,
      dailyRevenue: reportData.revenueByDay
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório Exportado",
      description: "O relatório foi baixado com sucesso.",
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-headline font-bold">Relatórios e Analytics</h1>
        <p className="text-primary-foreground/70 mt-1">
          Análise detalhada do desempenho da sua loja.
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Configurações do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Período</label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={(value: 'sales' | 'products' | 'customers') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Vendas</SelectItem>
                  <SelectItem value="products">Produtos</SelectItem>
                  <SelectItem value="customers">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={generateReport}>
                <Calendar className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" onClick={exportReport} disabled={!reportData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  R$ {reportData.totalRevenue.toFixed(2)}
                </div>
                <p className="text-xs text-primary-foreground/60">
                  {reportData.totalOrders} pedidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {reportData.totalOrders}
                </div>
                <p className="text-xs text-primary-foreground/60">
                  Total no período
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <Target className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-400">
                  R$ {reportData.averageOrderValue.toFixed(2)}
                </div>
                <p className="text-xs text-primary-foreground/60">
                  Por pedido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
                <Users className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">
                  {reportData.customerStats.newCustomers}
                </div>
                <p className="text-xs text-primary-foreground/60">
                  No período
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Produtos Mais Vendidos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos Mais Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade Vendida</TableHead>
                      <TableHead>Receita</TableHead>
                      <TableHead>% do Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.topProducts.map((item, index) => (
                      <TableRow key={item.product.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              #{index + 1}
                            </Badge>
                            {item.product.name}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>R$ {item.revenue.toFixed(2)}</TableCell>
                        <TableCell>
                          {reportData.totalRevenue > 0 
                            ? ((item.revenue / reportData.totalRevenue) * 100).toFixed(1)
                            : '0'
                          }%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas de Clientes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reportData.customerStats.totalCustomers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Novos Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  {reportData.customerStats.newCustomers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Clientes Recorrentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">
                  {reportData.customerStats.returningCustomers}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Receita Diária */}
          {reportData.revenueByDay.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Receita Diária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Pedidos</TableHead>
                        <TableHead>Receita</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.revenueByDay.map((day) => (
                        <TableRow key={day.date}>
                          <TableCell>{format(new Date(day.date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{day.orders}</TableCell>
                          <TableCell>R$ {day.revenue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
