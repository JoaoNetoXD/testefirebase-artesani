"use client";
import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseServicesAvailable } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface UserProfileData {
  name: string;
  phone?: string;
  email?: string;
  role?: string;
}

interface AuthContextType {
  currentUser: User | null;
  currentUserProfile: UserProfileData | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  register: (name: string, email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<{ success: boolean; isAdminUser: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserAccount: (data: Partial<UserProfileData>) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<UserProfileData | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfileData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchUserProfileInternal = useCallback(async (userId: string): Promise<UserProfileData | null> => {
    if (!supabase || !supabaseServicesAvailable) {
      return null;
    }
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', userId)
        .single();
      
      if (error && status !== 406) throw error;
      
      return data as UserProfileData | null;

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao buscar perfil";
      console.error("Erro ao buscar perfil do usuário:", message);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase || !supabaseServicesAvailable) {
      console.warn("AuthContext: Supabase client is not available. Auth features are disabled.");
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
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
      
      // CORREÇÃO: Definir loading como false para todos os eventos, não apenas INITIAL_SESSION
      setLoading(false);
    });
  
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfileInternal]);


  const notifySupabaseDisabled = () => {
    toast({ 
      title: "Funcionalidade Desabilitada", 
      description: "A configuração do Supabase está incompleta ou o serviço não está disponível. Verifique o console.", 
      variant: "destructive",
      duration: 10000
    });
    setLoading(false);
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
            full_name: name,
            phone: '', 
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Cadastro falhou, usuário não retornado.');
      
      await new Promise(res => setTimeout(res, 500)); 

      toast({ title: "Cadastro realizado!", description: "Bem-vindo(a)! Verifique seu email para confirmação, se aplicável." });
      router.push('/'); 
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente.";
      console.error("Erro no cadastro:", error);
      toast({ title: "Erro no Cadastro", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; isAdminUser: boolean }> => {
    if (!supabase || !supabaseServicesAvailable) {
      notifySupabaseDisabled();
      return { success: false, isAdminUser: false };
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) {
        console.error("Erro detalhado do login:", error);
        throw error;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      const profile = await fetchUserProfileInternal(user!.id);
      const userIsAdmin = profile?.role === 'admin';
      
      toast({ title: "Login realizado!", description: "Bem-vindo(a) de volta!" });
      return { success: true, isAdminUser: userIsAdmin };
    } catch (error: unknown) {
      console.error('Erro de login:', error)
      
      if (error instanceof Error) {
        // Verificar tipos específicos de erro do Supabase
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos. Verifique suas credenciais.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Email não confirmado. Verifique sua caixa de entrada.')
        } else if (error.message.includes('Too many requests')) {
          setError('Muitas tentativas de login. Tente novamente em alguns minutos.')
        } else {
          setError(`Erro de autenticação: ${error.message}`)
        }
      } else {
        setError('Erro desconhecido durante o login')
      }
      console.error("Erro no login:", error);
      toast({ title: "Erro no Login", description: message, variant: "destructive" });
      return { success: false, isAdminUser: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!supabase || !supabaseServicesAvailable) {
      notifySupabaseDisabled();
      return;
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
      toast({ title: "Logout realizado", description: "Até breve!" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente.";
      console.error("Erro no logout:", error);
      toast({ title: "Erro no Logout", description: message, variant: "destructive" });
    }
  };

  const resetPassword = async (email: string) => {
    if (!supabase || !supabaseServicesAvailable) {
      notifySupabaseDisabled();
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      toast({ title: "Email enviado", description: "Verifique sua caixa de entrada para redefinir a senha." });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente.";
      console.error("Erro ao resetar senha:", error);
      toast({ title: "Erro ao Enviar Email", description: message, variant: "destructive" });
    }
  };

  const updateUserAccount = async (updateData: Partial<UserProfileData>) => {
    if (!currentUser || !supabase || !supabaseServicesAvailable) {
      toast({ title: "Erro", description: "Você precisa estar logado para atualizar o perfil.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', currentUser.id);

      if (error) throw error;

      const updatedProfile = await fetchUserProfileInternal(currentUser.id);
      setCurrentUserProfile(updatedProfile);

      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente.";
      console.error("Erro ao atualizar perfil:", error);
      toast({ title: "Erro ao Atualizar", description: message, variant: "destructive" });
    }
  };

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
