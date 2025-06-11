
"use client";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await CategoryService.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') {
      toast({
        title: "Erro",
        description: "O nome da categoria não pode estar em branco.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newCategory = await CategoryService.createCategory({ name: newCategoryName, slug: newCategoryName.toLowerCase().replace(/\s+/g, '-') });
      if (newCategory) {
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
        toast({
          title: "Categoria Adicionada",
          description: `A categoria "${newCategory.name}" foi adicionada com sucesso.`,
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a categoria.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && newCategoryName.trim() !== '') {
      try {
        const updatedCategory = await CategoryService.updateCategory(editingCategory.id, { name: newCategoryName, slug: newCategoryName.toLowerCase().replace(/\s+/g, '-') });
        if (updatedCategory) {
          setCategories(categories.map(c => c.id === updatedCategory.id ? updatedCategory : c));
          setEditingCategory(null);
          setNewCategoryName('');
          toast({
            title: "Categoria Atualizada",
            description: `A categoria foi atualizada para "${updatedCategory.name}".`,
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a categoria.",
          variant: "destructive"
        });
      }
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await CategoryService.deleteCategory(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
      toast({
        title: "Categoria Excluída",
        description: "A categoria foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-headline">Gerenciamento de Categorias</h1>
        <div className="bg-card p-6 rounded-lg shadow-md border border-border">
          <p>Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline">Gerenciamento de Categorias</h1>
      
      <div className="bg-card p-6 rounded-lg shadow-md border border-border">
        <div className="flex gap-4 mb-6">
          <Input 
            type="text" 
            placeholder="Nova categoria..." 
            className="h-11"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory} className="h-11">
            {editingCategory ? 'Atualizar' : <><PlusCircle className="mr-2 h-5 w-5" /> Adicionar</>}
          </Button>
          {editingCategory && (
            <Button onClick={() => { setEditingCategory(null); setNewCategoryName(''); }} variant="outline" className="h-11">
              Cancelar
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => { setEditingCategory(category); setNewCategoryName(category.name); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a categoria &quot;{category.name}&quot;?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCategory(category.id)} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma categoria encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
