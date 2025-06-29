
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, Search, Filter, Package, Archive, ArchiveX } from 'lucide-react';
import SafeImage from "@/components/shared/SafeImage";
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
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ProductService } from '@/lib/services/productService';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProductStatusFilter = "active" | "archived" | "all";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatusFilter>("active");
  const { toast } = useToast();

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const includeArchived = statusFilter === 'all' || statusFilter === 'archived';
      const data = await ProductService.getAllProducts(includeArchived);
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, statusFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() =>
    products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (statusFilter === 'all') return matchesSearch;
      if (statusFilter === 'active') return product.is_active && matchesSearch;
      if (statusFilter === 'archived') return !product.is_active && matchesSearch;
      
      return false;
    }), [products, searchTerm, statusFilter]);

  const handleArchiveProduct = async (productId: string, productName: string) => {
    const result = await ProductService.archiveProduct(productId);
    if (result) {
      toast({
        title: "Produto Arquivado",
        description: `"${productName}" foi arquivado e não está mais visível na loja.`,
      });
      loadProducts();
    } else {
      toast({
        title: "Erro ao Arquivar",
        description: `Não foi possível arquivar o produto "${productName}".`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    const { success, message } = await ProductService.deleteProduct(productId);

    if (success) {
      toast({
        title: "Produto Excluído",
        description: `"${productName}" foi excluído permanentemente.`,
      });
      loadProducts();
    } else {
      toast({
        title: "Erro ao Excluir",
        description: message,
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
        <Skeleton className="h-11 w-full sm:w-52 bg-primary-foreground/10" />
      </div>
      <Card className="bg-primary-foreground/5 border-primary-foreground/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-11 flex-grow bg-primary-foreground/10" />
            <Skeleton className="h-11 w-44 bg-primary-foreground/10" />
          </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded-md bg-primary-foreground/10" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32 bg-primary-foreground/10" />
                              <Skeleton className="h-3 w-24 bg-primary-foreground/10" />
                            </div>
                        </div>
                        <Skeleton className="h-8 w-20 bg-primary-foreground/10" />
                        <div className="hidden sm:block">
                            <Skeleton className="h-8 w-24 bg-primary-foreground/10" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-md bg-primary-foreground/10" />
                          <Skeleton className="h-8 w-8 rounded-md bg-primary-foreground/10" />
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );

  const getStatus = (stock: number, isActive: boolean) => {
    if (!isActive) return { text: "Arquivado", className: "bg-gray-700/20 text-gray-300 border-gray-500/20" };
    if (stock === 0) return { text: "Esgotado", className: "bg-red-800/20 text-red-300 border-red-500/20" };
    if (stock <= 10) return { text: "Estoque Baixo", className: "bg-yellow-800/20 text-yellow-300 border-yellow-500/20" };
    return { text: "Em Estoque", className: "bg-green-800/20 text-green-300 border-green-500/20" };
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-4xl font-headline font-bold">Gerenciamento de Produtos</h1>
            <p className="text-primary-foreground/70 mt-1">Adicione, edite e organize todos os seus produtos.</p>
        </div>
        <Link href="/admin/products/new" passHref>
          <Button variant="secondary">
            <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Novo Produto
          </Button>
        </Link>
      </div>

      <Card className="bg-primary-foreground/5 border-primary-foreground/10">
         <CardHeader>
             <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-foreground/40" />
                    <Input
                    type="search"
                    placeholder="Buscar por nome ou categoria..."
                    className="pl-10 h-11 bg-transparent border-primary-foreground/20 focus:border-primary-foreground/40 placeholder:text-primary-foreground/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={(value: ProductStatusFilter) => setStatusFilter(value)}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 bg-transparent border-primary-foreground/20">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-primary-foreground/20 text-primary-foreground">
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="archived">Arquivados</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
            </div>
         </CardHeader>
        <CardContent>
            {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow className="border-b-primary-foreground/10">
                    <TableHead className="w-[60px] sm:w-[80px] text-primary-foreground/80">Imagem</TableHead>
                    <TableHead className="text-primary-foreground/80">Nome do Produto</TableHead>
                    <TableHead className="hidden md:table-cell text-primary-foreground/80">Categoria</TableHead>
                    <TableHead className="text-right text-primary-foreground/80">Preço</TableHead>
                    <TableHead className="text-right hidden sm:table-cell text-primary-foreground/80">Estoque</TableHead>
                    <TableHead className="text-center hidden lg:table-cell text-primary-foreground/80">Status</TableHead>
                    <TableHead className="text-right text-primary-foreground/80">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProducts.map((product) => {
                      const status = getStatus(product.stock, product.is_active);
                      return (
                      <TableRow key={product.id} className="border-b-primary-foreground/10 hover:bg-primary-foreground/5">
                          <TableCell>
                          <SafeImage
                              src={product.images?.[0] || 'https://placehold.co/50x50.png'}
                              alt={product.name}
                              width={50}
                              height={50}
                              className={`rounded-md object-cover border border-primary-foreground/20 ${!product.is_active ? 'opacity-50' : ''}`}
                              fallbackSrc="https://placehold.co/50x50.png"
                          />
                          </TableCell>
                          <TableCell className={`font-medium max-w-[150px] sm:max-w-xs truncate ${product.is_active ? 'text-white' : 'text-primary-foreground/50'}`}>
                              <Link href={`/admin/products/edit/${product.slug}`} className="hover:text-secondary hover:underline">
                                  {product.name}
                              </Link>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-primary-foreground/70">{product.category_name}</TableCell>
                          <TableCell className="text-right text-primary-foreground/90">R$ {product.price.toFixed(2).replace('.',',')}</TableCell>
                          <TableCell className="text-right hidden sm:table-cell text-primary-foreground/90">{product.stock}</TableCell>
                          <TableCell className="text-center hidden lg:table-cell">
                          <Badge variant="outline" className={status.className}>
                            {status.text}
                          </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                              <Button variant="outline" size="icon" asChild title="Editar Produto" className="bg-transparent border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-white">
                              <Link href={`/admin/products/edit/${product.slug}`}>
                                  <Edit className="h-4 w-4" />
                              </Link>
                              </Button>
                              <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" title="Arquivar Produto" className="bg-yellow-800/20 text-yellow-300 border-yellow-500/20 hover:bg-yellow-800/40">
                                      <Archive className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-background border-primary-foreground/20 text-primary-foreground">
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Arquivamento</AlertDialogTitle>
                                  <AlertDialogDescription className="text-primary-foreground/70">
                                      Tem certeza que deseja arquivar o produto &quot;{product.name}&quot;? Ele será ocultado da loja mas não será excluído permanentemente.
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10">Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleArchiveProduct(product.id, product.name)} className="bg-yellow-600 hover:bg-yellow-700">
                                      Arquivar
                                  </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon" title="Excluir Produto">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-background border-primary-foreground/20 text-primary-foreground">
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription className="text-primary-foreground/70">
                                    Tem certeza que deseja excluir permanentemente o produto &quot;{product.name}&quot;? Esta ação não pode ser desfeita e removerá o produto de todas as listas.
                                    <strong className="text-red-400 block mt-2">Esta ação só será possível se o produto não estiver associado a nenhum pedido.</strong>
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10">Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteProduct(product.id, product.name)} className="bg-red-600 hover:bg-red-700">
                                        Excluir Permanentemente
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                              </AlertDialog>
                          </div>
                          </TableCell>
                      </TableRow>
                    )})}
                </TableBody>
                </Table>
            </div>
            ) : (
            <div className="text-center py-16 text-primary-foreground/60">
                <Package className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-semibold">Nenhum produto encontrado.</p>
                {searchTerm && <p className="text-sm mt-1">Tente ajustar sua busca ou filtros.</p>}
                {!searchTerm && <p className="text-sm mt-1">Comece adicionando um novo produto.</p>}
            </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
