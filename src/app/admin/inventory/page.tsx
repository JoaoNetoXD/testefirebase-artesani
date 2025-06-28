"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, AlertTriangle, Package, Search, Loader2, TrendingDown } from 'lucide-react';
import { ProductService } from '@/lib/services/productService';
import { InventoryService } from '@/lib/services/inventoryService';
import type { Product } from '@/lib/types';
import Image from "next/image";
import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

export default function AdminInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStock, setEditingStock] = useState<{ productId: string; currentStock: number } | null>(null);
  const [newStock, setNewStock] = useState(0);
  const { toast } = useToast();

  const loadInventoryData = useCallback(async () => {
    setLoading(true);
    try {
      const [allProducts, lowStock] = await Promise.all([
        InventoryService.getInventoryReport(),
        InventoryService.getLowStockProducts(10)
      ]);
      
      setProducts(allProducts);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Erro ao carregar dados do inventário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do inventário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadInventoryData();
  }, [loadInventoryData]);

  const handleUpdateStock = async () => {
    if (!editingStock) return;

    setIsSubmitting(true);
    try {
      const success = await InventoryService.updateStock(editingStock.productId, newStock);
      
      if (success) {
        toast({
          title: "Estoque Atualizado",
          description: `Estoque atualizado para ${newStock} unidades.`,
        });
        setEditingStock(null);
        await loadInventoryData();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o estoque.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { 
      text: "Esgotado", 
      className: "bg-red-500/20 text-red-400 border-red-500/20",
      icon: <AlertTriangle className="h-3 w-3" />
    };
    if (stock <= 10) return { 
      text: "Estoque Baixo", 
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
      icon: <TrendingDown className="h-3 w-3" />
    };
    return { 
      text: "Em Estoque", 
      className: "bg-green-500/20 text-green-400 border-green-500/20",
      icon: <Package className="h-3 w-3" />
    };
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PageSkeleton = () => (
     <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-2">
            <Skeleton className="h-9 w-72 bg-primary-foreground/10" />
            <Skeleton className="h-4 w-96 bg-primary-foreground/10" />
        </div>
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
                  <Skeleton className="h-12 w-12 rounded-md bg-primary-foreground/10" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32 bg-primary-foreground/10" />
                    <Skeleton className="h-3 w-24 bg-primary-foreground/10" />
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <Skeleton className="h-6 w-20 bg-primary-foreground/10" />
                  <Skeleton className="h-6 w-24 bg-primary-foreground/10" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md bg-primary-foreground/10" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return <PageSkeleton />;
  }

  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;

  return (
    <div className="space-y-8 animate-fade-in-up">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold">Controle de Estoque</h1>
          <p className="text-primary-foreground/70 mt-1">
            Gerencie o estoque de todos os seus produtos em tempo real.
          </p>
        </div>
      </div>

      <Card className="bg-primary-foreground/5 border-primary-foreground/10">
         <CardHeader>
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-foreground/40" />
            <Input 
              type="search" 
              placeholder="Buscar por nome ou categoria..." 
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
                  <TableHead className="text-primary-foreground/80">Produto</TableHead>
                  <TableHead className="hidden md:table-cell text-primary-foreground/80">Categoria</TableHead>
                  <TableHead className="text-center text-primary-foreground/80">Estoque</TableHead>
                  <TableHead className="text-center hidden sm:table-cell text-primary-foreground/80">Status</TableHead>
                  <TableHead className="text-right text-primary-foreground/80">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product.stock);
                  return (
                    <TableRow key={product.id} className="border-b-primary-foreground/10 hover:bg-primary-foreground/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image 
                            src={product.images?.[0] || '/placeholder-product.png'} 
                            alt={product.name} 
                            width={50} 
                            height={50} 
                            className="rounded-md object-cover border border-primary-foreground/20"
                          />
                          <p className="font-medium text-white max-w-[150px] sm:max-w-xs truncate">{product.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-primary-foreground/70">{product.category_name}</TableCell>
                      <TableCell className="text-center font-bold text-lg">
                        <span className={product.stock === 0 ? 'text-red-400' : product.stock <= 10 ? 'text-yellow-400' : 'text-white'}>
                           {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <Badge variant="outline" className={status.className}>
                          {status.icon}
                          <span className="ml-1">{status.text}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingStock({ productId: product.id, currentStock: product.stock });
                                setNewStock(product.stock);
                              }}
                              className="bg-transparent border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-white"
                            >
                              <Edit className="h-4 w-4 sm:mr-2"/>
                              <span className="hidden sm:inline">Ajustar</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Atualizar Estoque - {product.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Estoque Atual</Label>
                                <p className="text-sm text-primary-foreground/70">{product.stock} unidades</p>
                              </div>
                              <div>
                                <Label htmlFor={`stock-${product.id}`}>Novo Estoque</Label>
                                <Input
                                  id={`stock-${product.id}`}
                                  type="number"
                                  min="0"
                                  value={newStock}
                                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                                  placeholder="Digite a nova quantidade"
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setEditingStock(null)}>
                                  Cancelar
                                </Button>
                                <Button 
                                  onClick={handleUpdateStock}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Atualizando...
                                    </>
                                  ) : (
                                    "Atualizar Estoque"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
             {filteredProducts.length === 0 && (
                <div className="text-center py-16 text-primary-foreground/60">
                    <Package className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg font-semibold">Nenhum produto encontrado.</p>
                    {searchTerm && <p className="text-sm mt-1">Tente ajustar sua busca.</p>}
                </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-primary-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{lowStock}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esgotados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Estoque Baixo */}
      {lowStockProducts.length > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 px-3 bg-yellow-500/5 rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-primary-foreground/60">{product.category_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/20">
                      {product.stock} restante{product.stock !== 1 ? 's' : ''}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditingStock({ productId: product.id, currentStock: product.stock });
                            setNewStock(product.stock);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Atualizar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Atualizar Estoque</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Produto</Label>
                            <p className="text-sm text-primary-foreground/70">{product.name}</p>
                          </div>
                          <div>
                            <Label htmlFor="newStock">Novo Estoque</Label>
                            <Input
                              id="newStock"
                              type="number"
                              min="0"
                              value={newStock}
                              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleUpdateStock}>
                              Atualizar Estoque
                            </Button>
                            <Button variant="outline" onClick={() => setEditingStock(null)}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
