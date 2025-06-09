
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, AlertCircle } from 'lucide-react';
import { mockProducts } from '@/lib/data'; // Using mock data
import Image from 'next/image';

export default function AdminInventoryPage() {
  const products = mockProducts; // In a real app, this would be live inventory data

  return (
    <div>
      <h1 className="text-3xl font-headline mb-8">Gerenciamento de Estoque</h1>
      <div className="bg-card p-6 rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagem</TableHead>
              <TableHead>Nome do Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Estoque Atual</TableHead>
              <TableHead className="text-center">Status do Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image 
                    src={product.images[0]} 
                    alt={product.name} 
                    width={50} 
                    height={50} 
                    className="rounded-md object-cover"
                    data-ai-hint="product icon" 
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell className="text-center">
                  {product.stock === 0 ? (
                    <Badge variant="destructive">Esgotado</Badge>
                  ) : product.stock <= 10 ? (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                      <AlertCircle className="mr-1 h-3 w-3" /> Baixo Estoque
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-green-500 text-white">Em Estoque</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" /> {/* Placeholder for edit stock action */}
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
