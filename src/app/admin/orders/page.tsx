
"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Search, Filter, Download, ShoppingCart, Info } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { OrderService } from '@/lib/services/orderService';
import type { Order, OrderItem } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from "next/legacy/image";

const getStatusBadgeDetails = (status: string) => {
    switch (status.toLowerCase()) {
      case "entregue":
        return { className: "bg-green-800/20 text-green-300 border-green-500/20" };
      case "enviado":
        return { className: "bg-blue-800/20 text-blue-300 border-blue-500/20" };
      case "processando":
        return { className: "bg-purple-800/20 text-purple-300 border-purple-500/20" };
      case "pendente":
        return { className: "bg-yellow-800/20 text-yellow-300 border-yellow-500/20" };
      case "cancelado":
         return { className: "bg-red-800/20 text-red-300 border-red-500/20" };
      default:
        return { className: "bg-primary-foreground/10 text-primary-foreground/70 border-primary-foreground/20" };
    }
};

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const ordersData = await OrderService.getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast({
          title: "Erro ao Carregar",
          description: "Não foi possível carregar a lista de pedidos.",
          variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  const filteredOrders = useMemo(() => 
    orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = order.id.toLowerCase().includes(searchLower) ||
                            (order.customer_name || '').toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === 'todos' || order.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
  }), [orders, searchTerm, statusFilter]);

  const handleExportCSV = () => {
     try {
        const dataToExport = filteredOrders.map(({ id, customer_name, created_at, total, status, payment_method }) => ({
            'ID do Pedido': id,
            'Cliente': customer_name || 'N/A',
            'Data': new Date(created_at).toLocaleDateString('pt-BR'),
            'Total': total.toFixed(2).replace('.',','),
            'Status': status,
            'Pagamento': payment_method || 'N/A',
        }));

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'pedidos_artesani.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Exportação Concluída",
            description: "O arquivo CSV com os dados dos pedidos foi baixado."
        });
        } catch (error) {
        console.error("Erro ao exportar CSV:", error);
        toast({
            title: "Erro na Exportação",
            description: "Não foi possível gerar o arquivo CSV.",
            variant: "destructive"
        });
        }
  };
  
  const PageSkeleton = () => (
     <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-2">
            <Skeleton className="h-9 w-72 bg-primary-foreground/10" />
            <Skeleton className="h-4 w-96 bg-primary-foreground/10" />
        </div>
        <Skeleton className="h-11 w-full sm:w-56 bg-primary-foreground/10" />
      </div>
      <Card className="bg-primary-foreground/5 border-primary-foreground/10">
        <CardHeader>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-11 md:col-span-2 bg-primary-foreground/10" />
              <Skeleton className="h-11 bg-primary-foreground/10" />
           </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({length: 5}).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-primary-foreground/10" />
                    <Skeleton className="h-3 w-32 bg-primary-foreground/10" />
                  </div>
                </div>
                <Skeleton className="h-6 w-24 rounded-md bg-primary-foreground/10" />
                <div className="hidden sm:block">
                  <Skeleton className="h-8 w-24 bg-primary-foreground/10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-4xl font-headline font-bold">Gerenciamento de Pedidos</h1>
            <p className="text-primary-foreground/70 mt-1">Acompanhe e administre todos os pedidos da sua loja.</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} className="bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground w-full sm:w-auto">
           <Download className="mr-2 h-4 w-4" /> Exportar Pedidos (CSV)
        </Button>
      </div>

      <Card className="bg-primary-foreground/5 border-primary-foreground/10">
        <CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-foreground/40" />
                    <Input 
                    type="search" 
                    placeholder="Buscar por ID do pedido ou nome do cliente..." 
                    className="pl-10 h-11 bg-transparent border-primary-foreground/20 focus:border-primary-foreground/40 placeholder:text-primary-foreground/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-11 bg-transparent border-primary-foreground/20 focus:ring-primary-foreground/40">
                    <Filter className="mr-2 h-4 w-4 text-primary-foreground/70" />
                    <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="processando">Processando</SelectItem>
                        <SelectItem value="enviado">Enviado</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow className="border-b-primary-foreground/10">
                    <TableHead className="text-primary-foreground/80">Pedido</TableHead>
                    <TableHead className="hidden sm:table-cell text-primary-foreground/80">Data</TableHead>
                    <TableHead className="hidden md:table-cell text-primary-foreground/80">Total</TableHead>
                    <TableHead className="text-center text-primary-foreground/80">Status</TableHead>
                    <TableHead className="text-right text-primary-foreground/80">Ações</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredOrders.map((order) => {
                    const statusDetails = getStatusBadgeDetails(order.status);
                    return (
                    <TableRow key={order.id} className="border-b-primary-foreground/10 hover:bg-primary-foreground/5">
                        <TableCell>
                            <div className="font-medium text-white">{order.customer_name || 'N/A'}</div>
                            <div className="text-sm text-primary-foreground/60 font-mono">#{order.id}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-primary-foreground/70">{new Date(order.created_at).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="hidden md:table-cell text-white font-semibold">R$ {order.total.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                        <Badge variant="outline" className={statusDetails.className}>
                            {order.status}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="bg-transparent border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-white">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only sm:not-sr-only sm:ml-2">Ver</span>
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-background border-primary-foreground/20 text-primary-foreground max-w-2xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Detalhes do Pedido <span className="font-mono text-secondary">#{order.id}</span></AlertDialogTitle>
                                    <AlertDialogDescription className="text-primary-foreground/70">
                                    Informações completas sobre o pedido e itens.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 py-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div className="flex flex-col space-y-2">
                                            <span className="text-primary-foreground/70">Cliente:</span>
                                            <span className="font-semibold text-white">{order.customer_name || 'Não informado'}</span>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <span className="text-primary-foreground/70">Data do Pedido:</span>
                                            <span className="font-semibold text-white">{new Date(order.created_at).toLocaleString('pt-BR')}</span>
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <span className="text-primary-foreground/70">Status do Pedido:</span>
                                            <Badge variant="outline" className={`${statusDetails.className} w-fit`}>{order.status}</Badge>
                                        </div>
                                         <div className="flex flex-col space-y-2">
                                            <span className="text-primary-foreground/70">Método de Pagamento:</span>
                                            <span className="font-semibold text-white">{order.payment_method || 'Não informado'}</span>
                                        </div>
                                    </div>

                                    {order.order_items && order.order_items.length > 0 ? (
                                    <div className="border-t border-primary-foreground/10 pt-4">
                                        <h4 className="font-semibold mb-3 text-white">Itens do Pedido</h4>
                                        <div className="space-y-3">
                                        {order.order_items.map((item, index) => (
                                            <div key={index} className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <Image src={item.products?.images?.[0] || '/placeholder-product.png'} alt={item.products?.name || 'Item'} width={48} height={48} className="rounded-md border border-primary-foreground/20"/>
                                                    <div>
                                                        <p className="font-semibold text-white">{item.products?.name || 'Produto indisponível'}</p>
                                                        <p className="text-sm text-primary-foreground/70">
                                                            {item.quantity} x R$ {item.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="font-semibold text-white text-right">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                    ) : (
                                        <div className="border-t border-primary-foreground/10 pt-4 text-center text-primary-foreground/60">
                                            <Info className="mx-auto h-8 w-8 mb-2"/>
                                            <p>Nenhum item encontrado para este pedido.</p>
                                        </div>
                                    )}

                                    <div className="border-t border-primary-foreground/10 pt-4 flex justify-end">
                                        <div className="text-right">
                                            <p className="text-primary-foreground/70">Subtotal:</p>
                                            <p className="text-xl font-bold text-white">R$ {order.total.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10">Fechar</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        </TableCell>
                    </TableRow>
                    );
                })}
                </TableBody>
            </Table>
            {filteredOrders.length === 0 && (
                <div className="text-center py-16 text-primary-foreground/60">
                    <ShoppingCart className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg font-semibold">Nenhum pedido encontrado.</p>
                    {searchTerm || statusFilter !== 'todos' ?
                        <p className="text-sm mt-1">Tente ajustar sua busca ou filtros.</p> :
                        <p className="text-sm mt-1">Quando um novo pedido for feito, ele aparecerá aqui.</p>
                    }
                </div>
            )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
