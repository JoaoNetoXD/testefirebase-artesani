
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
// Remover esta linha: import { mockProducts } from '@/lib/data'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, Search, Filter } from 'lucide-react';
import Image from 'next/image';
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
import { useState, useEffect } from 'react';
import { ProductService } from '@/lib/services/productService';
import type { Product } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Carregar produtos do Supabase
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await ProductService.getAllProducts();
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
  };

  // Filtrar produtos
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      const success = await ProductService.deleteProduct(productId);
      if (success) {
        toast({
          title: "Produto Excluído",
          description: `${productName} foi excluído com sucesso.`,
        });
        // Recarregar lista
        loadProducts();
      } else {
        throw new Error('Falha ao excluir produto');
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-headline">Gerenciamento de Produtos</h1>
        <Link href="/admin/products/new" passHref>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Adicionar Novo Produto
          </Button>
        </Link>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar por nome ou categoria..." 
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-11">
            <Filter className="mr-2 h-4 w-4" />
            Filtros Avançados
          </Button>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] sm:w-[80px]">Imagem</TableHead>
                  <TableHead>Nome do Produto</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Estoque</TableHead>
                  <TableHead className="text-center hidden lg:table-cell">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Image 
                        src={product.images[0] || 'https://placehold.co/80x80.png'} 
                        alt={product.name} 
                        width={50} 
                        height={50} 
                        className="rounded-md object-cover border border-border"
                        data-ai-hint="product icon" 
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[150px] sm:max-w-xs truncate">
                        <Link href={`/admin/products/edit/${product.slug}`} className="hover:text-primary hover:underline">
                            {product.name}
                        </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{product.category}</TableCell>
                    <TableCell className="text-right">R$ {product.price.toFixed(2).replace('.',',')}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{product.stock}</TableCell>
                    <TableCell className="text-center hidden lg:table-cell">
                      {product.stock === 0 ? (
                        <Badge variant="destructive">Esgotado</Badge>
                      ) : product.stock <= 10 ? (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">Baixo Estoque</Badge>
                      ) : (
                        <Badge className="bg-green-500 hover:bg-green-600 text-primary-foreground">Em Estoque</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" asChild title="Editar Produto">
                        <Link href={`/admin/products/edit/${product.slug}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" title="Excluir Produto">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o produto "{product.name}"? 
                              Esta ação é simulada e não excluirá o produto de verdade neste ambiente de demonstração. Em um ambiente real, esta ação seria irreversível.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id, product.name)} className="bg-destructive hover:bg-destructive/90">
                              Excluir (Simulado)
                            </AlertDialogAction>
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
            <p className="text-lg">Nenhum produto encontrado com os critérios atuais.</p>
            <p className="text-sm">Tente ajustar sua busca ou filtros.</p>
          </div>
        )}
      </div>
    </div>
  );
}
