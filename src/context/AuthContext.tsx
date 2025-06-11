
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useContext } from 'react';
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
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setLoading(false);
      }
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

  const fetchUserProfileInternal = async (userId: string): Promise<UserProfileData | null> => {
    if (!supabase || !supabaseServicesAvailable) {
      return null;
    }
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('name, email, role')
        .eq('id', userId)
        .single();
      
      if (error && status !== 406) {
        console.error('Erro na busca do perfil:', error);
        throw error;
      }
      return data as UserProfileData | null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido ao buscar perfil";
      console.error("Erro ao buscar perfil do usuário:", message);
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
            full_name: name,
            phone: '', 
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Cadastro falhou, usuário não retornado.');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            name: name,
            email: email,
            phone: '',
            role: 'user',
          }
        ]);
      
      if (profileError) {
        console.warn('Erro ao criar perfil do usuário, mas o cadastro foi bem-sucedido:', profileError.message);
      }

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
      const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (!loginData.user || !loginData.session) throw new Error('Login falhou, usuário ou sessão não retornados.');
      
      const profile = await fetchUserProfileInternal(loginData.user.id);
      const userIsAdmin = profile?.role === 'admin';

      setCurrentUser(loginData.user);
      setSession(loginData.session);
      setCurrentUserProfile(profile);
      setIsAdmin(userIsAdmin);
      
      toast({ title: "Login realizado!", description: "Bem-vindo(a) de volta!" });
      return { success: true, isAdminUser: userIsAdmin };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Email ou senha inválidos.";
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
      setCurrentUser(null);
      setCurrentUserProfile(null);
      setIsAdmin(false);
      setSession(null);
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({ title: "Logout realizado", description: "Até breve!" });
      router.push('/login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente.";
      console.error("Erro no logout:", error);
      toast({ title: "Erro no Logout", description: message, variant: "destructive" });
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      toast({ title: "Email enviado", description: "Verifique sua caixa de entrada para redefinir a senha." });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente.";
      console.error("Erro ao resetar senha:", error);
      toast({ title: "Erro ao Enviar Email", description: message, variant: "destructive" });
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
      const { ...dataToUpdate } = updateData;

      const { error } = await supabase
        .from('profiles')
        .update(dataToUpdate)
        .eq('id', currentUser.id);

      if (error) throw error;

      const updatedProfile = await fetchUserProfileInternal(currentUser.id);
      setCurrentUserProfile(updatedProfile);

      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente.";
      console.error("Erro ao atualizar perfil:", error);
      toast({ title: "Erro ao Atualizar", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
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
