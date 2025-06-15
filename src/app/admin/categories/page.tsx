"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, Loader2, ListTree } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { CategoryService } from '@/lib/services/categoryService';
import type { Category } from '@/lib/types';
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const categoriesData = await CategoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro ao Carregar",
        description: "Não foi possível carregar a lista de categorias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim() === '') {
      toast({
        title: "Erro de Validação",
        description: "O nome da categoria não pode estar em branco.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update
        const updatedCategory = await CategoryService.updateCategory(editingCategory.id, { name: categoryName, slug: categoryName.toLowerCase().replace(/\s+/g, '-') });
        if(updatedCategory) {
          setCategories(categories.map(c => c.id === updatedCategory.id ? {...c, ...updatedCategory} : c));
          toast({
            title: "Categoria Atualizada",
            description: `A categoria foi atualizada para "${updatedCategory.name}".`,
          });
        }
      } else {
        // Create
        const newCategory = await CategoryService.createCategory({ name: categoryName, slug: categoryName.toLowerCase().replace(/\s+/g, '-') });
        if (newCategory) {
            setCategories(prev => [...prev, { ...newCategory, product_count: 0 }]);
            toast({
                title: "Categoria Adicionada",
                description: `A categoria "${newCategory.name}" foi adicionada com sucesso.`,
            });
        }
      }
      setCategoryName('');
      setEditingCategory(null);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast({
        title: "Erro ao Salvar",
        description: `Não foi possível ${editingCategory ? 'atualizar' : 'adicionar'} a categoria.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    const result = await CategoryService.deleteCategory(categoryId);
    
    if (result.success) {
      setCategories(categories.filter(c => c.id !== categoryId));
      toast({
        title: "Categoria Excluída",
        description: `A categoria "${categoryName}" foi excluída com sucesso.`,
      });
    } else {
      toast({
        title: "Erro ao Excluir",
        description: result.message || "Não foi possível excluir a categoria.",
        variant: "destructive"
      });
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
  };
  
  const cancelEditing = () => {
    setEditingCategory(null);
    setCategoryName('');
  };

  const PageSkeleton = () => (
    <div className="space-y-8">
      <div className="space-y-2">
          <Skeleton className="h-9 w-72 bg-primary-foreground/10" />
          <Skeleton className="h-4 w-96 bg-primary-foreground/10" />
      </div>
      <Card className="bg-primary-foreground/5 border-primary-foreground/10">
        <CardHeader>
          <div className="flex gap-4">
            <Skeleton className="h-11 flex-grow bg-primary-foreground/10" />
            <Skeleton className="h-11 w-32 bg-primary-foreground/10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({length: 4}).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-primary-foreground/10" />
                  <Skeleton className="h-3 w-32 bg-primary-foreground/10" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 bg-primary-foreground/10 rounded-md" />
                  <Skeleton className="h-8 w-8 bg-primary-foreground/10 rounded-md" />
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
       <div>
            <h1 className="text-4xl font-headline font-bold">Gerenciamento de Categorias</h1>
            <p className="text-primary-foreground/70 mt-1">Crie e edite as categorias para seus produtos.</p>
        </div>
      
      <Card className="bg-primary-foreground/5 border-primary-foreground/10">
        <CardHeader>
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input 
              type="text" 
              placeholder={editingCategory ? "Editar nome da categoria..." : "Nova categoria..."}
              className="h-11 bg-transparent border-primary-foreground/20 focus:border-primary-foreground/40 placeholder:text-primary-foreground/50 flex-grow"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="flex gap-2">
              {editingCategory && (
                <Button onClick={cancelEditing} variant="outline" type="button" className="h-11 w-full sm:w-auto bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10" disabled={isSubmitting}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" className="h-11 w-full sm:w-auto" variant="secondary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (editingCategory ? 'Atualizar' : <PlusCircle className="mr-2 h-5 w-5" />)}
                {editingCategory ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-primary-foreground/10">
                  <TableHead className="text-primary-foreground/80">Nome</TableHead>
                  <TableHead className="hidden sm:table-cell text-primary-foreground/80">Slug</TableHead>
                   <TableHead className="text-center hidden sm:table-cell text-primary-foreground/80">Produtos</TableHead>
                  <TableHead className="text-right text-primary-foreground/80">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className="border-b-primary-foreground/10 hover:bg-primary-foreground/5">
                    <TableCell className="font-medium text-white">{category.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-primary-foreground/70">{category.slug}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell text-primary-foreground/70">{category.product_count}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="icon" title="Editar Categoria" onClick={() => startEditing(category)} className="bg-transparent border-primary-foreground/20 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" title="Excluir Categoria">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-background border-primary-foreground/20 text-primary-foreground">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription className="text-primary-foreground/70">
                                Tem certeza que deseja excluir a categoria &quot;{category.name}&quot;? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10">Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategory(category.id, category.name)}>
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {categories.length === 0 && (
              <div className="text-center py-16 text-primary-foreground/60">
                <ListTree className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-semibold">Nenhuma categoria encontrada.</p>
                <p className="text-sm mt-1">Comece adicionando uma nova categoria acima.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
