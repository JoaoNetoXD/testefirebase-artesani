
"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Eye, UserPlus, Search, Download, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
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
import Image from 'next/image';

// Mock data for demonstration
const mockCustomers = [
  { id: "CUST001", name: "João Silva", email: "joao.silva@example.com", totalSpent: 580.50, orders: 5, joined: "2023-01-15", avatar: "https://placehold.co/40x40.png?text=JS" },
  { id: "CUST002", name: "Maria Oliveira", email: "maria.oliveira@example.com", totalSpent: 320.00, orders: 3, joined: "2023-03-22", avatar: "https://placehold.co/40x40.png?text=MO" },
  { id: "CUST003", name: "Carlos Pereira", email: "carlos.pereira@example.com", totalSpent: 1250.75, orders: 12, joined: "2022-11-05", avatar: "https://placehold.co/40x40.png?text=CP" },
  { id: "CUST004", name: "Ana Costa", email: "ana.costa@example.com", totalSpent: 95.00, orders: 1, joined: "2024-02-10", avatar: "https://placehold.co/40x40.png?text=AC" },
];

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = mockCustomers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-headline">Gerenciamento de Clientes</h1>
        <div className="flex gap-2">
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Exportar Clientes (CSV)
            </Button>
            {/* <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <UserPlus className="mr-2 h-4 w-4" /> Adicionar Cliente
            </Button> */}
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
        
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px] hidden sm:table-cell">Avatar</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                        ID Cliente <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">
                     <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                        Total Gasto <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center hidden lg:table-cell">Pedidos</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/50">
                    <TableCell className="hidden sm:table-cell">
                      <Image 
                        src={customer.avatar} 
                        alt={customer.name} 
                        width={32} 
                        height={32} 
                        className="rounded-full object-cover"
                        data-ai-hint="user avatar" 
                      />
                    </TableCell>
                    <TableCell className="font-medium">{customer.id}</TableCell>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.email}</TableCell>
                    <TableCell className="text-right hidden lg:table-cell">R$ {customer.totalSpent.toFixed(2).replace('.',',')}</TableCell>
                    <TableCell className="text-center hidden lg:table-cell">{customer.orders}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" title="Ver Detalhes do Cliente">
                                <Eye className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Detalhes do Cliente: {customer.name}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    ID: {customer.id} <br />
                                    Email: {customer.email} <br />
                                    Membro desde: {customer.joined} <br />
                                    Total Gasto: R$ {customer.totalSpent.toFixed(2).replace('.',',')} <br />
                                    Número de Pedidos: {customer.orders}
                                    {/* Adicionar mais detalhes do cliente aqui, como histórico de pedidos */}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Fechar</AlertDialogCancel>
                                {/* <AlertDialogAction>Ver Histórico de Pedidos</AlertDialogAction> */}
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
            <div className="text-center py-12 text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg">Nenhum cliente encontrado.</p>
                <p className="text-sm">Tente refinar sua busca.</p>
            </div>
        )}
      </div>
    </div>
  );
}
