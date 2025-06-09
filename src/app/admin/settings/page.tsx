
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline mb-8">Configurações do Sistema</h1>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Configurações Gerais da Loja</CardTitle>
            <CardDescription>Informações básicas e configurações da sua farmácia online.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Nome da Loja</Label>
              <Input id="storeName" defaultValue="Artesani Pharmacy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Email de Contato Principal</Label>
              <Input id="storeEmail" type="email" defaultValue="contato@artesani.com" />
            </div>
             <div className="flex items-center space-x-2">
              <Switch id="maintenance-mode" />
              <Label htmlFor="maintenance-mode">Modo Manutenção</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Configurações de Pagamento</CardTitle>
            <CardDescription>Gerencie suas integrações de pagamento (Stripe).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stripeApiKey">Chave da API Secreta do Stripe</Label>
              <Input id="stripeApiKey" type="password" placeholder="sk_test_••••••••••••••••••••••••" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="stripePublishableKey">Chave Publicável do Stripe</Label>
              <Input id="stripePublishableKey" placeholder="pk_test_••••••••••••••••••••••••" />
            </div>
            <p className="text-sm text-muted-foreground">As chaves da API são confidenciais. Certifique-se de armazená-las com segurança.</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Configurações de Notificação</CardTitle>
            <CardDescription>Configure como você recebe notificações sobre pedidos e outras atividades.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="newOrderNotification">Notificações de Novos Pedidos (Email)</Label>
              <Switch id="newOrderNotification" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="lowStockNotification">Alertas de Baixo Estoque (Email)</Label>
              <Switch id="lowStockNotification" defaultChecked />
            </div>
             <div className="space-y-2">
              <Label htmlFor="notificationEmail">Email para Notificações Administrativas</Label>
              <Input id="notificationEmail" type="email" defaultValue="admin@artesani.com" />
            </div>
          </CardContent>
        </Card>

        <div className="pt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="lg" className="bg-primary text-primary-foreground">Salvar Todas as Configurações</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Funcionalidade Simulada</AlertDialogTitle>
                <AlertDialogDescription>
                  Em uma aplicação real, clicar neste botão salvaria todas as configurações no backend. 
                  Por enquanto, esta é uma ação simulada para fins de demonstração do frontend.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Entendi</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
