
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, Users, Package, DollarSign, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminReportsPage() {
  const reportCards = [
    { title: "Vendas Mensais", description: "Visão geral do faturamento ao longo do tempo.", icon: LineChart, chartType: "line" },
    { title: "Produtos Mais Vendidos", description: "Produtos com maior volume de vendas.", icon: BarChart, chartType: "bar" },
    { title: "Vendas por Categoria", description: "Distribuição de vendas entre as categorias.", icon: PieChart, chartType: "pie" },
    { title: "Atividade de Clientes", description: "Novos clientes, atividade e retenção.", icon: Users, chartType: "bar" },
    { title: "Desempenho de Produtos", description: "Margens, visualizações e conversões.", icon: Package, chartType: "line" },
    { title: "Receita por Período", description: "Comparativo de receita diária, semanal, mensal.", icon: DollarSign, chartType: "bar" },
  ];
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-headline">Relatórios e Análises</h1>
        <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-muted-foreground"/>
            <Select defaultValue="last30days">
                <SelectTrigger className="w-[180px] h-10">
                    <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                    <SelectItem value="thismonth">Este Mês</SelectItem>
                    <SelectItem value="lastmonth">Mês Passado</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" className="h-10">Aplicar Filtro</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <report.icon className="mr-3 h-6 w-6 text-primary" /> 
                {report.title}
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Placeholder for chart */}
              <div className="h-60 bg-muted/50 rounded-md flex items-center justify-center text-muted-foreground border border-dashed border-border">
                <div className="text-center">
                    <report.icon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                    <p>Gráfico de {report.title.toLowerCase()}</p>
                    <p className="text-xs">(Simulação de dados)</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
                <Button variant="link" className="p-0 text-primary">Ver relatório completo</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
