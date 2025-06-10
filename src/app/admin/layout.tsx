
"use client";
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) { // Apenas executa a lógica de redirecionamento se o estado de autenticação não estiver carregando
      if (!currentUser) {
        // Se não estiver logado, redireciona para login, preservando o caminho do admin
        router.push('/login?redirect=/admin');
      } else if (!isAdmin) {
        // Se estiver logado mas não for admin, redireciona para a página inicial
        router.push('/');
      }
      // Se estiver logado E for admin, nenhum router.push() acontece aqui,
      // o que significa que a tela de carregamento deve desaparecer e o conteúdo ser renderizado.
    }
  }, [currentUser, loading, isAdmin, router]);

  // Log dos valores para depuração, ANTES da condição de retorno do loader
  // Isso nos ajudará a ver o que o AdminLayout está "enxergando"
  if (typeof window !== 'undefined') { // Para evitar logs no lado do servidor se este componente for renderizado lá
    console.log('AdminLayout Status Check:', { 
      loading, 
      currentUserExists: !!currentUser, 
      userEmail: currentUser?.email, 
      isAdmin 
    });
  }

  // Condição para exibir a tela de carregamento
  // Se 'loading' é true, OU se não está carregando mas o usuário não existe (redirect vai acontecer),
  // OU se não está carregando, usuário existe, mas não é admin (redirect vai acontecer)
  if (loading || (!loading && !currentUser) || (!loading && currentUser && !isAdmin)) {
    // Se estiver realmente carregando, ou se as condições para ser admin não forem atendidas E o redirect ainda não ocorreu
    // (o useEffect acima cuidará do redirect em breve se necessário)
    // É importante mostrar o loader enquanto o redirect está pendente para evitar flash de conteúdo.
    // Se loading é false, currentUser existe e isAdmin é true, esta condição será falsa.
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Verificando acesso...</p>
      </div>
    );
  }

  // Se chegou até aqui, significa que:
  // loading = false
  // currentUser = existe
  // isAdmin = true
  // Então, renderiza o conteúdo do admin
  return (
    <div className="flex min-h-screen bg-muted">
      <AdminSidebar />
      <main className="flex-grow p-6 md:p-8 ml-0 md:ml-64">
        {children}
      </main>
    </div>
  );
}
