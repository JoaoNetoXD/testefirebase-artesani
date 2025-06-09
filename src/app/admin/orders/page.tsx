
"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Eye, Search, Filter, Download } from 'lucide-react';
import { useState } from 'react';
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

// Mock data for demonstration
const mockOrders = [
  { id: "ORD001", customer: "João Silva", date: "2024-07-15", total: 125.50, status: "Entregue", payment: "Cartão" },
  { id: "ORD002", customer: "Maria Oliveira", date: "2024-07-20", total: 78.90, status: "Enviado", payment: "PIX" },
  { id: "ORD003", customer: "Carlos Pereira", date: "2024-07-22", total: 210.00, status: "Processando", payment: "Cartão" },
  { id: "ORD004", customer: "Ana Costa", date: "2024-07-23", total: 55.00, status: "Pendente", payment: "PIX" },
  { id: "ORD005", customer: "Pedro Almeida", date: "2024-07-24", total: 350.00, status: "Cancelado", payment: "Cartão" },
];

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

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || order.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-headline">Gerenciamento de Pedidos</h1>
        <Button variant="outline">
           <Download className="mr-2 h-4 w-4" /> Exportar Pedidos (CSV)
        </Button>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar por ID do pedido ou cliente..." 
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Filtrar por status..." />
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

        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const badgeDetails = getStatusBadgeDetails(order.status);
                  return (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                      <TableCell className="text-right">R$ {order.total.toFixed(2).replace('.',',')}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={badgeDetails.variant} className={badgeDetails.className}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <Badge variant="outline">{order.payment}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="outline" size="icon" title="Ver Detalhes do Pedido">
                                <Eye className="h-4 w-4" />
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Detalhes do Pedido #{order.id}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta é uma visualização simulada dos detalhes do pedido.
                                    Cliente: {order.customer} <br />
                                    Total: R$ {order.total.toFixed(2).replace('.',',')} <br />
                                    Status: {order.status}
                                    {/* Adicionar mais detalhes do pedido aqui */}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Fechar</AlertDialogCancel>
                                {/* <AlertDialogAction>Marcar como Enviado</AlertDialogAction> */}
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
           <div className="text-center py-12 text-muted-foreground">
            <Search className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg">Nenhum pedido encontrado com os critérios atuais.</p>
            <p className="text-sm">Tente ajustar sua busca ou filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
