
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, UserPlus } from 'lucide-react';

export default function AdminCustomersPage() {
  // Mock data for demonstration
  const customers = [
    { id: "CUST001", name: "João Silva", email: "joao.silva@example.com", totalSpent: 580.50, orders: 5 },
    { id: "CUST002", name: "Maria Oliveira", email: "maria.oliveira@example.com", totalSpent: 320.00, orders: 3 },
    { id: "CUST003", name: "Carlos Pereira", email: "carlos.pereira@example.com", totalSpent: 1250.75, orders: 12 },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-headline">Gerenciamento de Clientes</h1>
        {/* <Button className="bg-primary text-primary-foreground">
          <UserPlus className="mr-2 h-4 w-4" /> Adicionar Cliente
        </Button> */}
      </div>
      <div className="bg-card p-6 rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID do Cliente</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Total Gasto</TableHead>
              <TableHead className="text-center">Nº Pedidos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.id}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell className="text-right">R$ {customer.totalSpent.toFixed(2).replace('.',',')}</TableCell>
                <TableCell className="text-center">{customer.orders}</TableCell>
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
