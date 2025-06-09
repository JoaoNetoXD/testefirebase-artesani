
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Meu Perfil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize suas informações pessoais aqui.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" defaultValue="Usuário Teste" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="usuario@teste.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" type="tel" defaultValue="(XX) XXXXX-XXXX" />
          </div>
          <Button className="bg-primary text-primary-foreground">Salvar Alterações</Button>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Endereço de Entrega</CardTitle>
          <CardDescription>Gerencie seus endereços de entrega.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for address management */}
          <p className="text-muted-foreground">Nenhum endereço cadastrado.</p>
          <Button variant="outline" className="mt-4">Adicionar Endereço</Button>
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
          <Button className="bg-primary text-primary-foreground">Alterar Senha</Button>
        </CardContent>
      </Card>
    </div>
  );
}
