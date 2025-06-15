
"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Eye, Search, Download, Users } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const customersData = await CustomerService.getAllCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast({
        title: "Erro ao Carregar",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() =>
    customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())
    ), [customers, searchTerm]);

  const handleExportCSV = () => {
    try {
      const dataToExport = filteredCustomers.map(({ id, name, email, totalSpent, orders, joined }) => ({
        ID: id,
        Nome: name,
        Email: email,
        'Total Gasto': totalSpent.toFixed(2).replace('.',','),
        'Pedidos': orders,
        'Membro Desde': new Date(joined).toLocaleDateString('pt-BR'),
      }));

      const csv = Papa.unparse(dataToExport);
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'clientes_artesani.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
          title: "Exportação Concluída",
          description: "O arquivo CSV com os dados dos clientes foi baixado."
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
          <Skeleton className="h-11 max-w-lg bg-primary-foreground/10" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({length: 5}).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full bg-primary-foreground/10" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 bg-primary-foreground/10" />
                    <Skeleton className="h-3 w-32 bg-primary-foreground/10" />
                  </div>
                </div>
                <div className="hidden md:block">
                  <Skeleton className="h-4 w-32 bg-primary-foreground/10" />
                </div>
                <div className="hidden sm:block">
                  <Skeleton className="h-8 w-24 bg-primary-foreground/10" />
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
          <h1 className="text-4xl font-headline font-bold">Gerenciamento de Clientes</h1>
          <p className="text-primary-foreground/70 mt-1">Visualize e exporte os dados dos seus clientes.</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} className="bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" /> Exportar Clientes (CSV)
        </Button>
      </div>
      <Card className="bg-primary-foreground/5 border-primary-foreground/10">
        <CardHeader>
          <div className="relative max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-foreground/40" />
              <Input 
                type="search" 
                placeholder="Buscar por ID, nome ou email..." 
                className="pl-10 h-11 bg-transparent border-primary-foreground/20 focus:border-primary-foreground/40 placeholder:text-primary-foreground/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-primary-foreground/10">
                  <TableHead className="text-primary-foreground/80">Cliente</TableHead>
                  <TableHead className="hidden md:table-cell text-primary-foreground/80">Email</TableHead>
                  <TableHead className="hidden lg:table-cell text-primary-foreground/80">Total Gasto</TableHead>
                  <TableHead className="hidden sm:table-cell text-primary-foreground/80">Pedidos</TableHead>
                  <TableHead className="hidden sm:table-cell text-primary-foreground/80">Membro desde</TableHead>
                  <TableHead className="text-right text-primary-foreground/80">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="border-b-primary-foreground/10 hover:bg-primary-foreground/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image 
                          src={customer.avatar || '/default-avatar.png'} 
                          alt={customer.name} 
                          width={40} 
                          height={40} 
                          className="rounded-full object-cover border border-primary-foreground/20"
                        />
                        <div>
                          <p className="font-medium text-white">{customer.name}</p>
                          <p className="text-sm text-primary-foreground/60 md:hidden">{customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-primary-foreground/70">{customer.email}</TableCell>
                    <TableCell className="hidden lg:table-cell text-primary-foreground/90">R$ {customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-primary-foreground/90">{customer.orders}</TableCell>
                    <TableCell className="hidden sm:table-cell text-primary-foreground/70">{new Date(customer.joined).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="bg-transparent border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-white">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only sm:not-sr-only sm:ml-2">Ver</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background border-primary-foreground/20 text-primary-foreground">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-3">
                                <Image src={customer.avatar || '/default-avatar.png'} alt={customer.name} width={48} height={48} className="rounded-full border border-primary-foreground/20"/>
                                {customer.name}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-primary-foreground/70 pt-2">
                              Informações detalhadas sobre o cliente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-4 py-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-primary-foreground/70">ID do Cliente:</span>
                                <span className="font-mono text-white">{customer.id}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-primary-foreground/70">Email:</span>
                                <span className="text-white">{customer.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary-foreground/70">Total Gasto:</span>
                                <span className="font-semibold text-white">R$ {customer.totalSpent.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary-foreground/70">Total de Pedidos:</span>
                                <span className="font-semibold text-white">{customer.orders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary-foreground/70">Membro desde:</span>
                                <span className="text-white">{new Date(customer.joined).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10">Fechar</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCustomers.length === 0 && (
              <div className="text-center py-16 text-primary-foreground/60">
                 <Users className="mx-auto h-12 w-12 mb-4" />
                 <p className="text-lg font-semibold">Nenhum cliente encontrado.</p>
                 {searchTerm && <p className="text-sm mt-1">Tente ajustar sua busca.</p>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
