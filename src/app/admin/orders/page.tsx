
"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Search, Filter, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { OrderService } from '@/lib/services/orderService';
import type { Order } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Papa from 'papaparse';

const getStatusBadgeDetails = (status: string) => {
    switch (status) {
      case "Entregue":
        return { variant: "default", className: "bg-green-500 hover:bg-green-600 text-primary-foreground" };
      case "Enviado":
        return { variant: "default", className: "bg-blue-500 hover:bg-blue-600 text-primary-foreground" };
      case "Processando":
        return { variant: "outline", className: "border-yellow-500 text-yellow-600 bg-yellow-500/10" };
      case "Pendente":
        return { variant: "outline", className: "border-orange-500 text-orange-600 bg-orange-500/10" };
      case "Cancelado":
         return { variant: "destructive", className: "bg-red-500 hover:bg-red-600 text-destructive-foreground" };
      default:
        return { variant: "secondary" };
    }
};

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersData = await OrderService.getAllOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleExportCSV = () => {
    const dataToExport = filteredOrders.map(order => ({
      ID_do_Pedido: order.id,
      Cliente: order.customer_name || 'N/A',
      Data: new Date(order.created_at).toLocaleDateString('pt-BR'),
      Total: `R$ ${order.total.toFixed(2)}`,
      Status: order.status,
      Pagamento: order.payment_method || 'N/A',
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'pedidos.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || order.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-headline">Gerenciamento de Pedidos</h1>
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
          <p>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-headline">Gerenciamento de Pedidos</h1>
        <Button variant="outline" onClick={handleExportCSV}>
           <Download className="mr-2 h-4 w-4" /> Exportar Pedidos (CSV)
        </Button>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar por ID do pedido ou nome do cliente..." 
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11">
              <Filter className="mr-2 h-4 w-4" />
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const statusDetails = getStatusBadgeDetails(order.status);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer_name || 'Cliente não informado'}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={statusDetails.variant as "default" | "secondary" | "destructive" | "outline" | null | undefined} 
                        className={statusDetails.className}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.payment_method || 'Não informado'}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Detalhes do Pedido #{order.id}</AlertDialogTitle>
                            <AlertDialogDescription>
                              Informações completas sobre o pedido.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p><strong>Cliente:</strong> {order.customer_name}</p>
                                <p><strong>Data:</strong> {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                                <p><strong>Status:</strong> {order.status}</p>
                              </div>
                              <div>
                                <p><strong>Total:</strong> R$ {order.total.toFixed(2)}</p>
                                <p><strong>Pagamento:</strong> {order.payment_method}</p>
                              </div>
                            </div>
                            {order.order_items && order.order_items.length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Itens do Pedido:</h4>
                                <div className="space-y-2">
                                  {order.order_items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                                      <span>{item.products?.name || 'Produto'} (x{item.quantity})</span>
                                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Fechar</AlertDialogCancel>
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
            <div className="text-center py-8 text-muted-foreground">
              Nenhum pedido encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
