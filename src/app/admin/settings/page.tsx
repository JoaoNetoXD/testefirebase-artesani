
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
              <Label htmlFor="storeName">Nome da Loja (Fantasia)</Label>
              <Input id="storeName" defaultValue="Farmácia Artesani" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="storeLegalName">Nome Legal da Empresa</Label>
              <Input id="storeLegalName" defaultValue="PHARMA MANIPULAÇÃO LTDA." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeCnpj">CNPJ</Label>
              <Input id="storeCnpj" defaultValue="08.306.438/0001-04" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeEmail">Email de Contato Principal</Label>
              <Input id="storeEmail" type="email" defaultValue="artesani.marketplace@gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storePhone">Telefone Principal</Label>
              <Input id="storePhone" type="tel" defaultValue="(86) 3221-8576" />
            </div>
             <div className="flex items-center space-x-2">
              <Switch id="maintenance-mode" />
              <Label htmlFor="maintenance-mode">Modo Manutenção</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Endereço da Empresa</CardTitle>
            <CardDescription>Endereço físico da farmácia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeAddressStreet">Rua e Número</Label>
              <Input id="storeAddressStreet" defaultValue="Rua 7 de Setembro, N° 226" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeAddressDistrict">Bairro</Label>
              <Input id="storeAddressDistrict" defaultValue="Centro Sul" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeAddressCity">Cidade</Label>
                <Input id="storeAddressCity" defaultValue="Teresina" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddressState">Estado</Label>
                <Input id="storeAddressState" defaultValue="Piauí" />
              </div>
            </div>
             {/* Poderia adicionar CEP aqui se necessário */}
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
              <Input id="notificationEmail" type="email" defaultValue="artesani.marketplace@gmail.com" />
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

    