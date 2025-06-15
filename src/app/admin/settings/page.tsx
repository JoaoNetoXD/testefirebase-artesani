
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, CreditCard, Bell, MapPin } from "lucide-react";

export default function AdminSettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
     // Simulate API call
    toast({
        title: "Configurações Salvas",
        description: "Suas alterações foram salvas com sucesso. (Simulação)",
    });
  };

  const settings = {
    storeName: "Artesani",
    legalName: "PHARMA MANIPULAÇÃO LTDA.",
    cnpj: "08.306.438/0001-04",
    email: "artesani.marketplace@gmail.com",
    phone: "(86) 3221-8576",
    street: "Rua 7 de Setembro, N° 226",
    district: "Centro Sul",
    city: "Teresina",
    state: "Piauí",
    notificationEmail: "artesani.marketplace@gmail.com",
  }

  const renderCard = (title: string, description: string, children: React.ReactNode) => (
    <Card className="bg-primary-foreground/5 border-primary-foreground/10">
        <CardHeader>
            <CardTitle className="text-white">{title}</CardTitle>
            <CardDescription className="text-primary-foreground/60">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {children}
        </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
        <div>
            <h1 className="text-4xl font-headline font-bold">Configurações do Sistema</h1>
            <p className="text-primary-foreground/70 mt-1">Gerencie as configurações globais da sua loja.</p>
        </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto bg-primary-foreground/5 mb-8">
            <TabsTrigger value="general"><Store className="w-4 h-4 mr-2"/> Geral</TabsTrigger>
            <TabsTrigger value="address"><MapPin className="w-4 h-4 mr-2"/> Endereço</TabsTrigger>
            <TabsTrigger value="payment"><CreditCard className="w-4 h-4 mr-2"/> Pagamento</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2"/> Notificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
            {renderCard("Gerais da Loja", "Informações básicas e modo de manutenção.",
                <>
                    <div className="space-y-2">
                        <Label htmlFor="storeName">Nome da Loja (Fantasia)</Label>
                        <Input id="storeName" defaultValue={settings.storeName} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="storeLegalName">Nome Legal da Empresa</Label>
                        <Input id="storeLegalName" defaultValue={settings.legalName} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="storeCnpj">CNPJ</Label>
                            <Input id="storeCnpj" defaultValue={settings.cnpj} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="storePhone">Telefone Principal</Label>
                            <Input id="storePhone" type="tel" defaultValue={settings.phone} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="storeEmail">Email de Contato Principal</Label>
                        <Input id="storeEmail" type="email" defaultValue={settings.email} />
                    </div>
                    <div className="flex items-center space-x-3 rounded-md border border-primary-foreground/10 p-4">
                        <Switch id="maintenance-mode" />
                        <div className="space-y-0.5">
                            <Label htmlFor="maintenance-mode">Modo Manutenção</Label>
                            <p className="text-xs text-primary-foreground/60">
                                Ao ativar, somente administradores logados poderão ver a loja.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </TabsContent>

        <TabsContent value="address">
            {renderCard("Endereço da Empresa", "Endereço físico da farmácia para faturamento e contato.",
                <>
                    <div className="space-y-2">
                        <Label htmlFor="storeAddressStreet">Rua e Número</Label>
                        <Input id="storeAddressStreet" defaultValue={settings.street} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="storeAddressDistrict">Bairro</Label>
                        <Input id="storeAddressDistrict" defaultValue={settings.district} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="storeAddressCity">Cidade</Label>
                            <Input id="storeAddressCity" defaultValue={settings.city} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="storeAddressState">Estado</Label>
                            <Input id="storeAddressState" defaultValue={settings.state} />
                        </div>
                    </div>
                </>
            )}
        </TabsContent>

        <TabsContent value="payment">
            {renderCard("Configurações de Pagamento", "Gerencie suas integrações de pagamento (Stripe).",
                <>
                    <div className="space-y-2">
                        <Label htmlFor="stripePublishableKey">Chave Publicável do Stripe</Label>
                        <Input id="stripePublishableKey" placeholder="pk_test_••••••••••••••••••••••••" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stripeApiKey">Chave da API Secreta do Stripe</Label>
                        <Input id="stripeApiKey" type="password" placeholder="sk_test_••••••••••••••••••••••••" />
                    </div>
                    <p className="text-sm text-primary-foreground/60">
                        As chaves da API são confidenciais. Nunca as compartilhe ou exponha no lado do cliente.
                    </p>
                </>
            )}
        </TabsContent>
        
        <TabsContent value="notifications">
            {renderCard("Configurações de Notificação", "Configure como você recebe alertas sobre atividades da loja.",
                <>
                     <div className="space-y-2">
                        <Label htmlFor="notificationEmail">Email para Notificações Administrativas</Label>
                        <Input id="notificationEmail" type="email" defaultValue={settings.notificationEmail} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-primary-foreground/10 p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="newOrderNotification">Notificações de Novos Pedidos</Label>
                             <p className="text-xs text-primary-foreground/60">Receber um email para cada novo pedido realizado.</p>
                        </div>
                        <Switch id="newOrderNotification" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-primary-foreground/10 p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="lowStockNotification">Alertas de Baixo Estoque</Label>
                             <p className="text-xs text-primary-foreground/60">Receber um email quando o estoque de um produto estiver baixo.</p>
                        </div>
                        <Switch id="lowStockNotification" defaultChecked />
                    </div>
                </>
            )}
        </TabsContent>

      </Tabs>

      <div className="pt-4 flex justify-end">
          <Button size="lg" onClick={handleSave} variant="secondary">
              Salvar Alterações
          </Button>
      </div>
    </div>
  );
}
