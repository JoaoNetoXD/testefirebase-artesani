
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js'; // Tipos do Supabase
import { supabase, supabaseServicesAvailable } from '@/lib/supabase'; // Importa o cliente Supabase
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface UserProfileData {
  name: string;
  phone?: string;
  email?: string;
  role?: string; // ✅ Certifique-se de que está descomentado
}

// Ajuste para refletir a estrutura do Supabase (User pode ser diferente)
interface AuthContextType {
  currentUser: User | null; // User do Supabase
  currentUserProfile: UserProfileData | null; // Perfil do usuário da tabela 'profiles'
  session: Session | null; // Session do Supabase
  loading: boolean;
  isAdmin: boolean; // Flag para verificar se é admin
  register: (name: string, email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserAccount: (data: Partial<UserProfileData>) => Promise<void>; // Partial para atualizações parciais
  fetchUserProfile: (userId: string) => Promise<UserProfileData | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext }; // Adicione esta linha para exportar AuthContext

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfileData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!supabase || !supabaseServicesAvailable) {
      console.warn("AuthContext: Supabase client is not available. Auth features are disabled.");
      setCurrentUser(null);
      setSession(null);
      setLoading(false);
      return;
    }

    const getSessionAndProfile = async () => {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting session:', sessionError.message);
        setLoading(false);
        return;
      }
      setSession(currentSession);
      const user = currentSession?.user ?? null;
      setCurrentUser(user);

      if (user) {
        const profile = await fetchUserProfileInternal(user.id);
        setCurrentUserProfile(profile);
        setIsAdmin(profile?.role === 'admin');
      } else {
        setCurrentUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth event:', event, session);
      setSession(session);
      const user = session?.user ?? null;
      setCurrentUser(user);

      if (user) {
        const profile = await fetchUserProfileInternal(user.id);
        setCurrentUserProfile(profile);
        setIsAdmin(profile?.role === 'admin');
      } else {
        setCurrentUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const notifySupabaseDisabled = () => {
    toast({ 
      title: "Funcionalidade Desabilitada", 
      description: "A configuração do Supabase está incompleta ou o serviço não está disponível. Verifique o console.", 
      variant: "destructive",
      duration: 10000
    });
    setLoading(false);
  };

  // Função interna para buscar perfil, usada no setup inicial e no onAuthStateChange
  const fetchUserProfileInternal = async (userId: string): Promise<UserProfileData | null> => {
    if (!supabase || !supabaseServicesAvailable) {
      console.log('🚫 Supabase não disponível');
      return null;
    }
    try {
      console.log('🔍 Buscando perfil para usuário:', userId);
      
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`name, phone, email, role`) // ✅ Adicionado 'role' de volta
        .eq('id', userId)
        .single();
  
      console.log('📊 Resultado da busca:', { data, error, status });
      
      if (error && status !== 406) { // 406 significa que não encontrou, o que é ok
        console.error('❌ Erro na busca do perfil:', error);
        throw error;
      }
  
      if (data) {
        console.log('✅ Perfil encontrado:', data);
        console.log('👤 Role do usuário:', data.role);
        console.log('🔐 É admin?', data.role === 'admin');
        return data as UserProfileData;
      }
      
      console.log('⚠️ Nenhum perfil encontrado para o usuário');
      return null;
    } catch (error: any) {
      console.error("❌ Erro ao buscar perfil do usuário:", error.message);
      return null;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    if (!supabase || !supabaseServicesAvailable) {
      notifySupabaseDisabled();
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password: pass,
        options: {
          data: { 
            full_name: name, // Supabase usa 'user_metadata' ou 'options.data' para dados adicionais no cadastro
            phone: '', // Adicionar campos conforme necessário
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Cadastro falhou, usuário não retornado.');

      // Inserir dados adicionais na tabela 'users' (ou 'profiles') se necessário
      // Supabase Auth já cria um registro em auth.users. Você pode ter uma tabela pública 'profiles'.
      const { error: profileError } = await supabase
        .from('profiles') // Assumindo que você tem uma tabela 'profiles' ligada por user_id
        .insert([
          {
            id: data.user.id, // Chave estrangeira para auth.users.id
            name: name,
            email: email, // Pode ser redundante se já estiver em auth.users
            phone: '',
            role: 'user', // Define o papel padrão como 'user'
            // criadoEm e atualizadoEm são gerenciados pelo Supabase (created_at, updated_at)
          }
        ]);
      
      if (profileError) {
        console.warn('Erro ao criar perfil do usuário, mas o cadastro foi bem-sucedido:', profileError.message);
        // Decida como lidar com isso. O usuário está cadastrado, mas o perfil pode não estar completo.
      }

      // O onAuthStateChange deve atualizar currentUser e session
      toast({ title: "Cadastro realizado!", description: "Bem-vindo(a)! Verifique seu email para confirmação, se aplicável." });
      router.push('/'); 
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({ title: "Erro no Cadastro", description: error.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (!supabase || !supabaseServicesAvailable) {
      notifySupabaseDisabled();
      return false;
    }
    setLoading(true);
    try {
      console.log('🔐 Iniciando login para:', email);
      const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (!loginData.user) throw new Error('Login falhou, usuário não retornado.');
      
      console.log('👤 Usuário logado:', loginData.user.email);
      
      // Após o login, buscar o perfil para ter o 'role'
      const profile = await fetchUserProfileInternal(loginData.user.id);
      console.log('📋 Perfil do usuário:', profile);
      
      setCurrentUserProfile(profile);
      const userIsAdmin = profile?.role === 'admin';
      setIsAdmin(userIsAdmin);
      
      console.log('🔑 É admin?', userIsAdmin);

      toast({ title: "Login realizado!", description: "Bem-vindo(a) de volta!" });
      
      // Não redirecionar aqui, deixar a página de login fazer isso
      return true;
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast({ title: "Erro no Login", description: error.message || "Email ou senha inválidos.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!supabase || !supabaseServicesAvailable) {
      notifySupabaseDisabled();
      setCurrentUser(null);
      setCurrentUserProfile(null); // Limpa o perfil no logout
      setIsAdmin(false); // Reseta o status de admin
      setSession(null);
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // O onAuthStateChange deve atualizar currentUser e session para null
      toast({ title: "Logout realizado", description: "Até breve!" });
      router.push('/login');
    } catch (error: any) {
      console.error("Erro no logout:", error);
      toast({ title: "Erro no Logout", description: error.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase || !supabaseServicesAvailable) {
      notifySupabaseDisabled();
      return;
    }
    setLoading(true);
    try {
      // Certifique-se de configurar o template de email no Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password` // URL para onde o usuário será redirecionado após clicar no link do email
      });
      if (error) throw error;
      toast({ title: "Email enviado", description: "Verifique sua caixa de entrada para redefinir a senha." });
    } catch (error: any) {
      console.error("Erro ao resetar senha:", error);
      toast({ title: "Erro ao Enviar Email", description: error.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateUserAccount = async (updateData: Partial<UserProfileData>) => {
    if (!currentUser || !supabase || !supabaseServicesAvailable) {
      notifySupabaseDisabled();
      toast({ title: "Erro", description: "Você precisa estar logado para atualizar o perfil.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Não permitir atualização de 'role' por esta função, a menos que seja um admin atualizando outro usuário  
      const { role, ...dataToUpdate } = updateData;

      const { error } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', currentUser.id);

      if (error) throw error;

      // Atualizar o estado local do perfil
      const updatedProfile = await fetchUserProfileInternal(currentUser.id);
      setCurrentUserProfile(updatedProfile);
      // Não é necessário atualizar isAdmin aqui, pois o papel não deve ser alterado por esta função.

      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast({ title: "Erro ao Atualizar", description: error.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Função pública para buscar perfil, se necessário em outros componentes
  const fetchUserProfile = async (userId: string): Promise<UserProfileData | null> => {
    return fetchUserProfileInternal(userId);
  };

  const value = {
    currentUser,
    currentUserProfile,
    session,
    loading,
    isAdmin,
    register,
    login,
    logout,
    resetPassword,
    updateUserAccount,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
