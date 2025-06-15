
"use client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { BarChart, LineChart, PieChart, Users, Package, DollarSign, CalendarDays, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock Data - In a real application, this would come from an API
const salesData = [
  { month: "Jan", sales: 4000 }, { month: "Fev", sales: 3000 }, { month: "Mar", sales: 5000 },
  { month: "Abr", sales: 4500 }, { month: "Mai", sales: 6000 }, { month: "Jun", sales: 8000 }
];
const topProductsData = [
  { name: "Produto A", sales: 120 }, { name: "Produto B", sales: 98 }, { name: "Produto C", sales: 86 },
  { name: "Produto D", sales: 74 }, { name: "Produto E", sales: 60 }
];
const categoryData = [
  { name: 'Eletrônicos', value: 400 }, { name: 'Roupas', value: 300 },
  { name: 'Acessórios', value: 300 }, { name: 'Casa', value: 200 },
];
const customerActivityData = [
  { name: 'Semana 1', new: 10, returning: 25 }, { name: 'Semana 2', new: 15, returning: 30 },
  { name: 'Semana 3', new: 12, returning: 35 }, { name: 'Semana 4', new: 20, returning: 40 }
];

export default function AdminReportsPage() {

  const reportCards = [
    { title: "Vendas Mensais", description: "Visão geral do faturamento.", icon: LineChart, chart: 
      <RechartsLineChart data={salesData}>
        <XAxis dataKey="month" stroke="hsl(var(--primary-foreground) / 0.5)" fontSize={12} />
        <YAxis stroke="hsl(var(--primary-foreground) / 0.5)" fontSize={12} tickFormatter={(value) => `R$${value/1000}k`}/>
        <Tooltip
          contentStyle={{ 
            background: "hsl(var(--background))", 
            borderColor: "hsl(var(--primary-foreground) / 0.2)",
            color: "hsl(var(--primary-foreground))"
          }}
          itemStyle={{ color: "hsl(var(--primary-foreground))" }}
        />
        <Line type="monotone" dataKey="sales" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--secondary))" }}/>
      </RechartsLineChart>
    },
    { title: "Produtos Mais Vendidos", description: "Produtos com maior volume de vendas.", icon: BarChart, chart:
      <RechartsBarChart data={topProductsData}>
        <XAxis dataKey="name" stroke="hsl(var(--primary-foreground) / 0.5)" fontSize={12} />
        <YAxis stroke="hsl(var(--primary-foreground) / 0.5)" fontSize={12} />
        <Tooltip
          contentStyle={{ 
            background: "hsl(var(--background))", 
            borderColor: "hsl(var(--primary-foreground) / 0.2)",
            color: "hsl(var(--primary-foreground))"
          }}
          itemStyle={{ color: "hsl(var(--primary-foreground))" }}
        />
        <Bar dataKey="sales" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    },
     { title: "Vendas por Categoria", description: "Distribuição de vendas entre as categorias.", icon: PieChart, chart:
      <RechartsPieChart>
        <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--secondary))" label />
        <Tooltip
          contentStyle={{ 
            background: "hsl(var(--background))", 
            borderColor: "hsl(var(--primary-foreground) / 0.2)",
            color: "hsl(var(--primary-foreground))"
          }}
        />
      </RechartsPieChart>
    },
    { title: "Atividade de Clientes", description: "Novos clientes vs. recorrentes.", icon: Users, chart:
       <RechartsBarChart data={customerActivityData}>
        <XAxis dataKey="name" stroke="hsl(var(--primary-foreground) / 0.5)" fontSize={12} />
        <YAxis stroke="hsl(var(--primary-foreground) / 0.5)" fontSize={12} />
        <Tooltip
           contentStyle={{ 
            background: "hsl(var(--background))", 
            borderColor: "hsl(var(--primary-foreground) / 0.2)",
            color: "hsl(var(--primary-foreground))"
          }}
        />
        <Legend wrapperStyle={{fontSize: "12px", color: "hsl(var(--primary-foreground) / 0.7)"}}/>
        <Bar dataKey="new" stackId="a" fill="hsl(var(--secondary))" name="Novos"/>
        <Bar dataKey="returning" stackId="a" fill="hsl(var(--primary))" name="Recorrentes"/>
      </RechartsBarChart>
    },
  ];
  
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-4xl font-headline font-bold">Relatórios e Análises</h1>
            <p className="text-primary-foreground/70 mt-1">Insights sobre o desempenho da sua loja.</p>
        </div>
        <div className="flex items-center gap-2">
            <Select defaultValue="last30days">
                <SelectTrigger className="w-full sm:w-[180px] h-11 bg-transparent border-primary-foreground/20 focus:ring-primary-foreground/40">
                    <CalendarDays className="mr-2 h-4 w-4 text-primary-foreground/70"/>
                    <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" className="h-11 bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10">
                <Filter className="mr-2 h-4 w-4"/> Aplicar
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {reportCards.map((report, index) => (
          <Card key={index} className="bg-primary-foreground/5 border-primary-foreground/10 hover:border-primary-foreground/20 transition-all duration-300 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-white">
                <report.icon className="mr-3 h-6 w-6 text-secondary" /> 
                {report.title}
              </CardTitle>
              <CardDescription className="text-primary-foreground/60">{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ResponsiveContainer width="100%" height={300}>
                {report.chart}
              </ResponsiveContainer>
            </CardContent>
            <CardFooter>
                <Button variant="link" className="p-0 text-secondary hover:text-secondary/80">Ver relatório detalhado</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
