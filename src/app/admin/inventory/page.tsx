
"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, AlertCircle, PackagePlus, Search } from 'lucide-react';
import { ProductService } from '@/lib/services/productService';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
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

export default function AdminInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<{ productId: string; currentStock: number } | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await ProductService.getAllProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenStockEditor = (productId: string, currentStock: number) => {
    setEditingStock({ productId, currentStock });
    setNewStockValue(currentStock);
  };

  const handleSaveStock = async () => {
    if (editingStock) {
      try {
        // Aqui você implementaria a atualização do estoque no Supabase
        // await ProductService.updateStock(editingStock.productId, newStockValue);
        
        toast({
          title: "Estoque Atualizado",
          description: `Estoque do produto ID ${editingStock.productId} atualizado para ${newStockValue}.`,
        });
        
        // Atualizar a lista de produtos
        const updatedProducts = products.map(product => 
          product.id === editingStock.productId 
            ? { ...product, stock: newStockValue }
            : product
        );
        setProducts(updatedProducts);
        setEditingStock(null);
      } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o estoque.",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-headline">Gerenciamento de Estoque</h1>
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
          <p>Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-headline">Gerenciamento de Estoque</h1>
        <Link href="/admin/products/new" passHref>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
            <PackagePlus className="mr-2 h-5 w-5" /> Adicionar Produto ao Estoque
          </Button>
        </Link>
      </div>

      <div className="bg-card p-4 sm:p-6 rounded-lg shadow-md border border-border">
         <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Buscar por ID, nome ou categoria..." 
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const isLowStock = product.stock < 10;
                const isOutOfStock = product.stock === 0;
                
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image 
                          src={product.imageUrl} 
                          alt={product.name} 
                          width={50} 
                          height={50} 
                          className="rounded-md object-cover border border-border"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={isOutOfStock ? 'text-red-600' : isLowStock ? 'text-yellow-600' : ''}>
                          {product.stock}
                        </span>
                        {isLowStock && !isOutOfStock && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                        {isOutOfStock && <AlertCircle className="h-4 w-4 text-red-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={isOutOfStock ? "destructive" : isLowStock ? "outline" : "default"}
                        className={isOutOfStock ? "" : isLowStock ? "border-yellow-500 text-yellow-600 bg-yellow-500/10" : "bg-green-500 hover:bg-green-600 text-primary-foreground"}
                      >
                        {isOutOfStock ? "Sem Estoque" : isLowStock ? "Estoque Baixo" : "Em Estoque"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenStockEditor(product.id, product.stock)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar Estoque
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Editar Estoque</AlertDialogTitle>
                              <AlertDialogDescription>
                                Altere a quantidade em estoque para {product.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Quantidade Atual: {product.stock}</label>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Nova Quantidade:</label>
                                <Input 
                                  type="number" 
                                  value={newStockValue}
                                  onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                                  min="0"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setEditingStock(null)}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleSaveStock}>Salvar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Link href={`/admin/products/edit/${product.slug}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar Produto
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
