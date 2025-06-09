
"use client";
import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  Auth,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth as firebaseAuth, db } from '@/lib/firebase'; // Renomeado para evitar conflito
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
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user document in Firestore
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        phone: '', // Initialize phone as empty
        // address: {}, // Initialize address later
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });

      setCurrentUser(userCredential.user); // Atualiza o currentUser imediatamente
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
    if (!currentUser) {
      toast({ title: "Erro", description: "Nenhum usuário logado.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // Update Firebase Auth display name
      if (data.name && data.name !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: data.name });
      }

      // Update Firestore document
      const userDocRef = doc(db, "users", currentUser.uid);
      const updateData: any = {
        name: data.name,
        atualizadoEm: serverTimestamp(),
      };
      if (data.phone !== undefined) {
        updateData.phone = data.phone;
      }
      await updateDoc(userDocRef, updateData);
      
      // Refresh currentUser state (or parts of it) if needed, or rely on onAuthStateChanged
      // For immediate UI update of displayName:
      setCurrentUser(firebaseAuth.currentUser); 

      toast({ title: "Perfil Atualizado!", description: "Suas informações foram salvas." });
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      toast({ title: "Erro ao Atualizar", description: error.message || "Não foi possível salvar as alterações.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
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
