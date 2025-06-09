
"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit, AlertCircle, PackagePlus, Search, Filter, ArrowUpDown } from 'lucide-react';
import { mockProducts } from '@/lib/data'; 
import Image from 'next/image';
import Link from 'next/link';
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
import { useToast } from '@/hooks/use-toast';

export default function AdminInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStock, setEditingStock] = useState<{ productId: string; currentStock: number } | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const { toast } = useToast();

  // Simulação de filtragem
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenStockEditor = (productId: string, currentStock: number) => {
    setEditingStock({ productId, currentStock });
    setNewStockValue(currentStock);
  };

  const handleSaveStock = () => {
    if (editingStock) {
      // Simulação de atualização de estoque
      console.log(`Atualizando estoque do produto ${editingStock.productId} de ${editingStock.currentStock} para ${newStockValue}`);
      // Aqui você chamaria a API para atualizar o estoque no backend
      toast({
        title: "Estoque Atualizado (Simulado)",
        description: `Estoque do produto ID ${editingStock.productId} atualizado para ${newStockValue}.`,
      });
      // Em um app real, você atualizaria o mockProducts ou faria um refetch dos dados.
      // Por ora, apenas fechamos o modal.
      setEditingStock(null);
    }
  };


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
          {/* Placeholder para mais filtros se necessário */}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] sm:w-[80px]">Imagem</TableHead>
                  <TableHead>Nome do Produto</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                        Estoque Atual <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-center">Status</TableHead>
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
                    <TableCell className="text-right font-semibold">{product.stock}</TableCell>
                    <TableCell className="text-center">
                      {product.stock === 0 ? (
                        <Badge variant="destructive" className="whitespace-nowrap">Esgotado</Badge>
                      ) : product.stock <= 10 ? (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-500/10 whitespace-nowrap">
                          <AlertCircle className="mr-1 h-3 w-3" /> Baixo Estoque
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 hover:bg-green-600 text-primary-foreground whitespace-nowrap">Em Estoque</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" title="Editar Estoque" onClick={() => handleOpenStockEditor(product.id, product.stock)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
            <div className="text-center py-12 text-muted-foreground">
                <Search className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg">Nenhum produto encontrado.</p>
                <p className="text-sm">Tente ajustar sua busca.</p>
            </div>
        )}
      </div>

      {/* Modal para editar estoque */}
      {editingStock && (
        <AlertDialog open={!!editingStock} onOpenChange={() => setEditingStock(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Editar Estoque do Produto ID: {editingStock.productId}</AlertDialogTitle>
              <AlertDialogDescription>
                Estoque atual: {editingStock.currentStock}. Insira o novo valor do estoque.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Input 
                type="number"
                value={newStockValue}
                onChange={(e) => setNewStockValue(parseInt(e.target.value, 10))}
                min="0"
                className="h-11 text-lg"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setEditingStock(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveStock} className="bg-primary hover:bg-primary/90">
                Salvar Novo Estoque
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
