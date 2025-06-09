
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default function OrderHistoryPage() {
  // Mock data for demonstration
  const orders = [
    { 
      id: "ORD001", 
      date: "2024-07-15", 
      total: 125.50, 
      status: "Entregue",
      items: [
        { id: "p1", name: "Analgésico Potente", quantity: 2, price: 25.99, imageUrl: "https://placehold.co/80x80.png" },
        { id: "p2", name: "Vitamina C Efervescente", quantity: 1, price: 32.50, imageUrl: "https://placehold.co/80x80.png" },
      ]
    },
    { 
      id: "ORD002", 
      date: "2024-07-20", 
      total: 78.90, 
      status: "Enviado",
      items: [
        { id: "p3", name: "Creme Hidratante Facial", quantity: 1, price: 59.90, imageUrl: "https://placehold.co/80x80.png" },
      ] 
    },
    { 
      id: "ORD003", 
      date: "2024-07-22", 
      total: 210.00, 
      status: "Processando",
      items: [
        { id: "p4", name: "Shampoo Antiqueda Manipulado", quantity: 2, price: 75.00, imageUrl: "https://placehold.co/80x80.png" },
        { id: "p5", name: "Protetor Solar FPS 50", quantity: 1, price: 45.00, imageUrl: "https://placehold.co/80x80.png" },
      ]
    },
     { 
      id: "ORD004", 
      date: "2024-07-25", 
      total: 55.00, 
      status: "Pendente",
      items: [
        { id: "p6", name: "Sabonete Líquido Neutro", quantity: 1, price: 55.00, imageUrl: "https://placehold.co/80x80.png" },
      ]
    },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Entregue":
        return "bg-green-600 hover:bg-green-700 text-primary-foreground";
      case "Enviado":
        return "bg-blue-600 hover:bg-blue-700 text-primary-foreground";
      case "Processando":
        return "bg-yellow-500 hover:bg-yellow-600 text-yellow-950";
      case "Pendente":
        return "bg-slate-500 hover:bg-slate-600 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };


  return (
    <div>
      <h1 className="text-3xl font-headline mb-6">Meus Pedidos</h1>
      {orders.length === 0 ? (
        <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <CardTitle className="text-xl">Pedido #{order.id}</CardTitle>
                  <Badge 
                    className={getStatusBadgeClass(order.status)}
                  >
                    {order.status}
                  </Badge>
                </div>
                <CardDescription>Data: {order.date}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <h4 className="font-semibold text-md mb-2 text-card-foreground">Itens do Pedido:</h4>
                <ul className="space-y-3">
                  {order.items.map(item => (
                    <li key={item.id} className="flex items-center gap-4 p-3 bg-card-foreground/5 rounded-md">
                       <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        width={60} 
                        height={60} 
                        className="rounded-md object-cover border border-border"
                        data-ai-hint="product thumbnail" 
                      />
                      <div className="flex-grow">
                        <p className="font-medium text-card-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantidade: {item.quantity}</p>
                      </div>
                      <p className="text-md font-semibold text-card-foreground">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.',',')}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <Separator />
              <CardFooter className="pt-4 flex justify-end">
                <p className="text-lg font-bold text-primary">Total do Pedido: R$ {order.total.toFixed(2).replace('.',',')}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
