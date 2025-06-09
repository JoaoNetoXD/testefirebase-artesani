
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

export default function AdminOrdersPage() {
  // Mock data for demonstration
  const orders = [
    { id: "ORD001", customer: "João Silva", date: "2024-07-15", total: 125.50, status: "Entregue" },
    { id: "ORD002", customer: "Maria Oliveira", date: "2024-07-20", total: 78.90, status: "Enviado" },
    { id: "ORD003", customer: "Carlos Pereira", date: "2024-07-22", total: 210.00, status: "Processando" },
    { id: "ORD004", customer: "Ana Costa", date: "2024-07-23", total: 55.00, status: "Pendente" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-headline mb-8">Gerenciamento de Pedidos</h1>
      <div className="bg-card p-6 rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID do Pedido</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell className="text-right">R$ {order.total.toFixed(2).replace('.',',')}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={
                      order.status === 'Entregue' ? 'default' : 
                      order.status === 'Enviado' ? 'secondary' : 
                      order.status === 'Processando' ? 'outline' : 
                      'destructive'
                    }
                    className={
                      order.status === 'Entregue' ? 'bg-green-500 text-white' : 
                      order.status === 'Enviado' ? 'bg-blue-500 text-white' :
                      order.status === 'Processando' ? 'border-yellow-500 text-yellow-600' :
                      ''
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
