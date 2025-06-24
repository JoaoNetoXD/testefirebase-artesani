
"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, AlertTriangle, Package, Search, Loader2 } from 'lucide-react';
import { ProductService } from '@/lib/services/productService';
import { InventoryService } from '@/lib/services/inventoryService';
import type { Product } from '@/lib/types';
import Image from "next/legacy/image";
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStock, setEditingStock] = useState<{ productId: string; productName: string } | null>(null);
  const [newStockValue, setNewStockValue] = useState<number | string>('');
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const productsData = await ProductService.getAllProducts();
      setProducts(productsData.sort((a,b) => a.stock - b.stock));
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
       toast({
        title: "Erro ao Carregar",
        description: "Não foi possível carregar os dados de estoque.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() =>
    products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]);

  const handleOpenStockEditor = (productId: string, productName: string, currentStock: number) => {
    setEditingStock({ productId, productName });
    setNewStockValue(currentStock);
  };
  
  const handleCloseStockEditor = () => {
    setEditingStock(null);
    setNewStockValue('');
  };

  const handleSaveStock = async () => {
    if (!editingStock || newStockValue === '' || Number(newStockValue) < 0) {
        toast({ title: "Valor Inválido", description: "Por favor, insira um valor de estoque válido (número maior ou igual a zero).", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      const stock = Number(newStockValue);
      await InventoryService.updateStock(editingStock.productId, stock);
      
      setProducts(prevProducts =>
        prevProducts.map(p => 
          p.id === editingStock.productId ? { ...p, stock } : p
        ).sort((a,b) => a.stock - b.stock)
      );
      
      toast({
        title: "Estoque Atualizado",
        description: `O estoque de "${editingStock.productName}" foi atualizado para ${stock}.`,
      });
      
      handleCloseStockEditor();
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível atualizar o estoque do produto.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatus = (stock: number) => {
    if (stock === 0) return { text: "Esgotado", className: "bg-red-800/20 text-red-300 border-red-500/20" };
    if (stock <= 10) return { text: "Estoque Baixo", className: "bg-yellow-800/20 text-yellow-300 border-yellow-500/20" };
    return { text: "Em Estoque", className: "bg-green-800/20 text-green-300 border-green-500/20" };
  };

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

  return (
    <div className="space-y-8 animate-fade-in-up">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold">Gerenciamento de Estoque</h1>
          <p className="text-primary-foreground/70 mt-1">Monitore e ajuste os níveis de estoque dos seus produtos.</p>
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
                  const status = getStatus(product.stock);
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
                        <Badge variant="outline" className={status.className}>{status.text}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenStockEditor(product.id, product.name, product.stock)}
                          className="bg-transparent border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-white"
                        >
                          <Edit className="h-4 w-4 sm:mr-2"/>
                          <span className="hidden sm:inline">Ajustar</span>
                        </Button>
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

      {editingStock && (
        <AlertDialog open onOpenChange={handleCloseStockEditor}>
            <AlertDialogContent className="bg-background border-primary-foreground/20 text-primary-foreground">
              <AlertDialogHeader>
                <AlertDialogTitle>Editar Estoque</AlertDialogTitle>
                <AlertDialogDescription className="text-primary-foreground/70">
                  Altere a quantidade em estoque para <span className="font-semibold text-white">{editingStock.productName}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <label htmlFor="stock-input" className="text-sm font-medium text-primary-foreground/80">Nova Quantidade</label>
                <Input 
                  id="stock-input"
                  type="number" 
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(e.target.value === '' ? '' : Number(e.target.value))}
                  min="0"
                  className="mt-2 h-11 bg-transparent border-primary-foreground/20 focus:border-primary-foreground/40"
                  autoFocus
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleCloseStockEditor} className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleSaveStock} disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
