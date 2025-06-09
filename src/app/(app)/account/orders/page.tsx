
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OrderHistoryPage() {
  // Mock data for demonstration
  const orders = [
    { id: "ORD001", date: "2024-07-15", total: 125.50, status: "Entregue" },
    { id: "ORD002", date: "2024-07-20", total: 78.90, status: "Enviado" },
    { id: "ORD003", date: "2024-07-22", total: 210.00, status: "Processando" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Meus Pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Pedido #{order.id}</span>
                  <Badge variant={order.status === 'Entregue' ? 'default' : order.status === 'Enviado' ? 'secondary' : 'outline'}
                    className={order.status === 'Entregue' ? 'bg-green-500 text-white' : order.status === 'Enviado' ? 'bg-blue-500 text-white' : ''}
                  >
                    {order.status}
                  </Badge>
                </CardTitle>
                <CardDescription>Data: {order.date} - Total: R$ {order.total.toFixed(2).replace('.',',')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Detalhes do pedido aqui...</p>
                 {/* Placeholder for order items */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
