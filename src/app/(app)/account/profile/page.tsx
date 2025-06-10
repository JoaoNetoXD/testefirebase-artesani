
"use client";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


const profileSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Email inválido.").readonly(), // Email is read-only
  phone: z.string().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { currentUser, updateUserAccount, loading, fetchUserProfile } = useAuth();
  const [firestoreUser, setFirestoreUser] = useState<any>(null); // Consider renaming if not using Firestore directly
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (currentUser) {
      setValue("name", currentUser.displayName || ""); // Supabase uses displayName on User object directly
      setValue("email", currentUser.email || "");
      
      // If you store additional profile info (like phone, custom name) separately (e.g., in a 'profiles' table)
      fetchUserProfile(currentUser.uid).then(profile => { // Supabase User object has 'uid' (or 'id')
        if (profile) {
          setFirestoreUser(profile); // Keep this if 'profiles' table data is what you mean by firestoreUser
          setValue("phone", profile.phone || "");
          if (profile.name) setValue("name", profile.name); // Prefer name from profiles table if available
        }
      });
    }
  }, [currentUser, setValue, fetchUserProfile, firestoreUser]); // Added firestoreUser

  const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
    const { email, ...updateData } = data; // email is readonly and part of auth, not profiles table directly
    await updateUserAccount(updateData);
  };

  const handleSimulatedPasswordChange = () => {
    toast({
        title: "Alteração de Senha Simulada",
        description: "Em um aplicativo real, você seria solicitado a confirmar sua senha atual e definir uma nova.",
    })
  }

  if (loading && !currentUser && !firestoreUser) { // Adjusted loading condition
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-400px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Meu Perfil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize suas informações pessoais aqui.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} readOnly className="bg-muted/50 cursor-not-allowed" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" type="tel" placeholder="(XX) XXXXX-XXXX" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <Button type="submit" className="bg-primary text-primary-foreground" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Alterações"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Endereço de Entrega</CardTitle>
          <CardDescription>Gerencie seus endereços de entrega.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum endereço cadastrado.</p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="mt-4">Adicionar Endereço</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Funcionalidade Futura</AlertDialogTitle>
                <AlertDialogDescription>
                  O gerenciamento de endereços será implementado em breve. 
                  Por enquanto, esta funcionalidade é apenas visual.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Entendi</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

       <Card className="mt-8">
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Mantenha sua conta segura.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirmar Nova Senha</Label>
            <Input id="confirm-new-password" type="password" />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">Alterar Senha</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Funcionalidade Simulada</AlertDialogTitle>
                <AlertDialogDescription>
                  A alteração de senha é uma funcionalidade crítica e será implementada com todos os protocolos de segurança necessários. 
                  Por enquanto, esta ação é apenas visual.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={handleSimulatedPasswordChange}>Entendi</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

