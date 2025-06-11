
"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Eye, Search, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CustomerService } from '@/lib/services/customerService';
import type { Customer } from '@/lib/types';
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
import Image from 'next/image';
import Papa from 'papaparse';

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersData = await CustomerService.getAllCustomers();
        setCustomers(customersData);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleExportCSV = () => {
    const dataToExport = filteredCustomers.map(customer => ({
      ID: customer.id,
      Nome: customer.name,
      Email: customer.email,
      Total_Gasto: `R$ ${customer.totalSpent.toFixed(2)}`,
      Pedidos: customer.orders,
      Membro_Desde: new Date(customer.joined).toLocaleDateString('pt-BR'),
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'clientes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-headline">Gerenciamento de Clientes</h1>
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
          <p>Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-headline">Gerenciamento de Clientes</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" /> Exportar Clientes (CSV)
            </Button>
        </div>
      </div>
      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar por ID, nome ou email do cliente..." 
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total Gasto</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Membro desde</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image 
                        src={customer.avatar} 
                        alt={customer.name} 
                        width={40} 
                        height={40} 
                        className="rounded-full object-cover border border-border"
                      />
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {customer.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>R$ {customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>{new Date(customer.joined).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Detalhes do Cliente</AlertDialogTitle>
                          <AlertDialogDescription>
                            Informações detalhadas sobre {customer.name}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Image 
                              src={customer.avatar} 
                              alt={customer.name} 
                              width={60} 
                              height={60} 
                              className="rounded-full object-cover border border-border"
                            />
                            <div>
                              <h3 className="font-semibold text-lg">{customer.name}</h3>
                              <p className="text-muted-foreground">{customer.email}</p>
                              <p className="text-sm text-muted-foreground">ID: {customer.id}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Total Gasto</p>
                              <p className="text-lg">R$ {customer.totalSpent.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Total de Pedidos</p>
                              <p className="text-lg">{customer.orders}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Membro desde</p>
                            <p>{new Date(customer.joined).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Fechar</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cliente encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
