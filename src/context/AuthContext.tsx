
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  // Auth, // Auth type is imported from firebase/auth directly where needed
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth as firebaseAuth, db } from '@/lib/firebase'; // firebaseAuth pode ser null
import { doc, setDoc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface UserProfileData {
  name: string;
  phone?: string;
  // Add other fields like address later
}
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  register: (name: string, email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserAccount: (data: UserProfileData) => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<any | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!firebaseAuth) {
      console.warn("AuthContext: Firebase Auth service is not available. Auth features are disabled.");
      setCurrentUser(null);
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const notifyFirebaseDisabled = () => {
    toast({ 
      title: "Funcionalidade Desabilitada", 
      description: "A configuração do Firebase está incompleta. Verifique o console para mais detalhes.", 
      variant: "destructive",
      duration: 10000 // Longer duration for important persistent warnings
    });
    setLoading(false);
  };

  const register = async (name: string, email: string, pass: string) => {
    if (!firebaseAuth || !db) {
      notifyFirebaseDisabled();
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        phone: '',
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });

      setCurrentUser(userCredential.user);
      toast({ title: "Cadastro realizado!", description: "Bem-vindo(a)!" });
      router.push('/'); 
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({ title: "Erro no Cadastro", description: error.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    if (!firebaseAuth) {
      notifyFirebaseDisabled();
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, pass);
      toast({ title: "Login realizado!", description: "Bem-vindo(a) de volta!" });
      router.push('/');
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast({ title: "Erro no Login", description: error.message || "Email ou senha inválidos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!firebaseAuth) {
      notifyFirebaseDisabled();
      // Simular logout local se o Firebase não estiver disponível
      setCurrentUser(null);
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      await firebaseSignOut(firebaseAuth);
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
    if (!firebaseAuth) {
      notifyFirebaseDisabled();
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      toast({ title: "Email enviado", description: "Verifique sua caixa de entrada para redefinir a senha." });
    } catch (error: any) {
      console.error("Erro ao resetar senha:", error);
      toast({ title: "Erro ao Enviar Email", description: error.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateUserAccount = async (data: UserProfileData) => {
    if (!currentUser || !firebaseAuth || !db) { // Adicionado !firebaseAuth e !db
      notifyFirebaseDisabled();
      if(!currentUser) toast({ title: "Erro", description: "Nenhum usuário logado.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (data.name && data.name !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: data.name });
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      const updateData: any = {
        name: data.name,
        atualizadoEm: serverTimestamp(),
      };
      if (data.phone !== undefined) {
        updateData.phone = data.phone;
      }
      await updateDoc(userDocRef, updateData);
      
      // firebaseAuth.currentUser pode não ser o mais atualizado aqui sem um refresh
      // É melhor confiar no onAuthStateChanged ou buscar o usuário novamente se necessário
      // Para displayName, podemos atualizar o estado local:
      const updatedUser = { ...currentUser, displayName: data.name, phoneNumber: data.phone || currentUser.phoneNumber };
      setCurrentUser(updatedUser as User);


      toast({ title: "Perfil Atualizado!", description: "Suas informações foram salvas." });
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast({ title: "Erro ao Atualizar", description: error.message || "Não foi possível salvar as alterações.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    if (!db) {
      notifyFirebaseDisabled();
      return null;
    }
    setLoading(true);
    try {
      const userDocRef = doc(db, "users", userId);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No such document for user profile!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    resetPassword,
    updateUserAccount,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
