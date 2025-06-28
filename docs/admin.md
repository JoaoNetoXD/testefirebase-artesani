# 👑 Painel Administrativo

## 📋 Visão Geral

O painel administrativo da Artesani oferece controle completo sobre todos os aspectos do e-commerce, desde gestão de produtos e categorias até análise de vendas e relatórios. Acessível apenas para usuários com role de administrador.

---

## 🏗️ Estrutura do Admin

### **Localização**
- **Páginas**: `src/app/admin/`
- **Componentes**: `src/components/admin/`
- **Layout**: `src/app/admin/layout.tsx`

### **Roteamento**
```
/admin/
├── page.tsx (Dashboard)
├── products/
│   ├── page.tsx (Lista de produtos)
│   ├── new/page.tsx (Novo produto)
│   └── edit/[slug]/page.tsx (Editar produto)
├── categories/page.tsx (Gestão de categorias)
├── orders/page.tsx (Gestão de pedidos)
├── customers/page.tsx (Gestão de clientes)
├── inventory/page.tsx (Controle de estoque)
├── reports/page.tsx (Relatórios)
└── settings/page.tsx (Configurações)
```

---

## 🔐 Controle de Acesso

### **Verificação de Permissão**
```typescript
// Layout do admin
useEffect(() => {
  if (!loading) {
    if (!currentUser) {
      router.push('/login?redirect=/admin');
    } else if (!isAdmin) {
      router.push('/');
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta área",
        variant: "destructive"
      });
    }
  }
}, [currentUser, loading, isAdmin, router]);
```

### **Proteção de Rotas**
```typescript
// Middleware de proteção
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading, isAdmin } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }
  
  if (!currentUser || !isAdmin) {
    redirect('/login');
  }
  
  return <>{children}</>;
};
```

---

## 📊 Dashboard Principal

### **Métricas Principais**
```typescript
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  topProducts: Product[];
  monthlyRevenue: { month: string; revenue: number }[];
}
```

### **Componentes do Dashboard**
- **Cards de Métricas**: Vendas, receita, produtos, clientes
- **Gráfico de Vendas**: Evolução mensal
- **Pedidos Recentes**: Lista dos últimos pedidos
- **Produtos Mais Vendidos**: Top 5 produtos
- **Alertas**: Estoque baixo, pedidos pendentes

---

## 🛍️ Gestão de Produtos

### **Lista de Produtos**
```typescript
// Funcionalidades principais
- Visualização em tabela/grid
- Busca e filtros avançados
- Ordenação por colunas
- Ações em lote (ativar/desativar)
- Paginação
- Export para CSV/Excel
```

### **Formulário de Produto**
```typescript
// Campos do formulário
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  images: string[];
  ingredients?: string;
  intended_uses?: string;
  tags?: string;
  is_active: boolean;
}
```

### **Upload de Imagens**
```typescript
// Componente de upload
const ImageUpload = ({ onUpload, maxFiles = 5 }) => {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (files: FileList) => {
    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);
          
        if (error) throw error;
        
        return supabase.storage
          .from('product-images')
          .getPublicUrl(data.path).data.publicUrl;
      });
      
      const urls = await Promise.all(uploadPromises);
      onUpload(urls);
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload" className="cursor-pointer">
        {uploading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Enviando...
          </div>
        ) : (
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Clique para enviar imagens</p>
          </div>
        )}
      </label>
    </div>
  );
};
```

---

## 🏷️ Gestão de Categorias

### **Funcionalidades**
```typescript
// Operações disponíveis
- Criar nova categoria
- Editar categoria existente
- Deletar categoria (com verificação de produtos)
- Reordenar categorias
- Ativar/desativar categorias
```

### **Formulário de Categoria**
```typescript
interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
}

// Validação de slug único
const validateSlug = async (slug: string, currentId?: string) => {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .neq('id', currentId || '');
    
  return data?.length === 0;
};
```

---

## 📦 Gestão de Pedidos

### **Lista de Pedidos**
```typescript
// Filtros disponíveis
interface OrderFilters {
  status?: Order['status'];
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Estados de pedido
enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}
```

### **Detalhes do Pedido**
```typescript
// Informações exibidas
- Dados do cliente
- Itens do pedido
- Endereço de entrega
- Status de pagamento
- Histórico de status
- Ações disponíveis (atualizar status, cancelar, etc.)
```

### **Atualização de Status**
```typescript
const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (error) throw error;
    
    // Enviar notificação ao cliente
    await sendStatusUpdateEmail(orderId, newStatus);
    
    toast({
      title: "Status Atualizado",
      description: `Pedido marcado como ${newStatus}`,
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
  }
};
```

---

## 👥 Gestão de Clientes

### **Lista de Clientes**
```typescript
// Informações exibidas
interface CustomerView {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Date;
  registrationDate: Date;
}
```

### **Detalhes do Cliente**
```typescript
// Seções do perfil
- Informações pessoais
- Histórico de pedidos
- Produtos favoritos
- Endereços salvos
- Estatísticas de compra
```

---

## 📊 Controle de Estoque

### **Visão Geral do Estoque**
```typescript
interface InventoryItem {
  product: Product;
  currentStock: number;
  minStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: Date;
}
```

### **Alertas de Estoque**
```typescript
// Produtos com estoque baixo
const getLowStockProducts = async () => {
  const { data } = await supabase
    .from('products')
    .select('*')
    .lt('stock', 10) // Estoque menor que 10
    .eq('is_active', true);
    
  return data || [];
};

// Componente de alerta
const StockAlert = ({ product }: { product: Product }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <div className="flex items-center">
      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
      <div>
        <h4 className="font-medium text-yellow-800">{product.name}</h4>
        <p className="text-sm text-yellow-600">
          Estoque baixo: {product.stock} unidades restantes
        </p>
      </div>
    </div>
  </div>
);
```

### **Atualização de Estoque**
```typescript
const updateStock = async (productId: string, newStock: number) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);
      
    if (error) throw error;
    
    toast({
      title: "Estoque Atualizado",
      description: `Novo estoque: ${newStock} unidades`,
    });
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
  }
};
```

---

## 📈 Relatórios e Analytics

### **Tipos de Relatório**
```typescript
// Relatórios disponíveis
- Vendas por período
- Produtos mais vendidos
- Performance de categorias
- Análise de clientes
- Relatório financeiro
- Análise de estoque
```

### **Geração de Relatórios**
```typescript
interface ReportParams {
  type: 'sales' | 'products' | 'customers' | 'financial';
  dateFrom: Date;
  dateTo: Date;
  format: 'pdf' | 'excel' | 'csv';
}

const generateReport = async (params: ReportParams) => {
  try {
    // Buscar dados baseado no tipo de relatório
    const data = await fetchReportData(params);
    
    // Gerar arquivo no formato solicitado
    const file = await generateFile(data, params.format);
    
    // Download do arquivo
    downloadFile(file, `relatorio-${params.type}-${Date.now()}`);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
  }
};
```

### **Gráficos e Visualizações**
```typescript
// Usando Chart.js ou similar
const SalesChart = ({ data }: { data: SalesData[] }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold mb-4">Vendas Mensais</h3>
    <Line
      data={{
        labels: data.map(d => d.month),
        datasets: [{
          label: 'Vendas (R$)',
          data: data.map(d => d.revenue),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        }]
      }}
      options={{
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `R$ ${value}`
            }
          }
        }
      }}
    />
  </div>
);
```

---

## 🎨 Interface e Componentes

### **Design Guidelines**

> **⚠️ IMPORTANTE - Padrão de Design:**
> 
> **Mantenha sempre a consistência visual!**
> - Use as cores primárias da Artesani
> - Mantenha elementos bem centralizados e alinhados
> - Preserve a identidade visual estabelecida
> - Siga os padrões de posicionamento da página home

### **Sidebar de Navegação**
```typescript
// Componente AdminSidebar
const AdminSidebar = () => {
  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Produtos', href: '/admin/products', icon: Package },
    { label: 'Categorias', href: '/admin/categories', icon: Tag },
    { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Clientes', href: '/admin/customers', icon: Users },
    { label: 'Estoque', href: '/admin/inventory', icon: Archive },
    { label: 'Relatórios', href: '/admin/reports', icon: BarChart3 },
    { label: 'Configurações', href: '/admin/settings', icon: Settings },
  ];
  
  return (
    <div className="w-64 bg-white shadow-lg h-full">
      <div className="p-6">
        <Logo />
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50"
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};
```

### **Tabelas de Dados**
```typescript
// Componente reutilizável de tabela
const DataTable = ({ 
  columns, 
  data, 
  loading, 
  onSort, 
  onFilter 
}: DataTableProps) => (
  <div className="bg-white rounded-lg shadow overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Dados</h3>
        <div className="flex space-x-2">
          <SearchInput onSearch={onFilter} />
          <Button onClick={() => exportData(data)}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
    </div>
    
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => onSort(column.key)}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
```

---

## 🔧 Configurações do Sistema

### **Configurações Gerais**
```typescript
interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
}
```

### **Configurações de E-mail**
```typescript
interface EmailSettings {
  provider: 'smtp' | 'sendgrid' | 'mailgun';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail: string;
  fromName: string;
}
```

### **Configurações de Pagamento**
```typescript
interface PaymentSettings {
  stripeEnabled: boolean;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  paymentMethods: ('card' | 'pix' | 'boleto')[];
  minOrderAmount: number;
  maxOrderAmount: number;
}
```

---

## 📱 Responsividade

### **Mobile Admin**
```typescript
// Adaptações para mobile
- Sidebar colapsível
- Tabelas com scroll horizontal
- Cards responsivos
- Menu hambúrguer
- Formulários otimizados para touch
```

### **Breakpoints**
```css
/* Tailwind breakpoints utilizados */
sm: 640px   /* Tablet pequeno */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeno */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grande */
```

---

## 🚨 Logs e Auditoria

### **Sistema de Logs**
```typescript
interface AdminLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id: string;
  old_values?: any;
  new_values?: any;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}

// Exemplo de log
const logAction = async (action: string, resource: string, resourceId: string, changes?: any) => {
  await supabase.from('admin_logs').insert({
    user_id: currentUser.id,
    action,
    resource,
    resource_id: resourceId,
    new_values: changes,
    ip_address: getClientIP(),
    user_agent: navigator.userAgent
  });
};
```

---

## 🔒 Segurança

### **Validações de Segurança**
```typescript
// Verificações implementadas
- Autenticação obrigatória
- Verificação de role admin
- Validação de inputs
- Sanitização de dados
- Rate limiting para ações sensíveis
- Logs de auditoria
- Verificação de CSRF
```

### **Backup de Dados**
```typescript
// Rotina de backup automático
const createBackup = async () => {
  const tables = ['products', 'categories', 'orders', 'profiles'];
  const backupData = {};
  
  for (const table of tables) {
    const { data } = await supabase.from(table).select('*');
    backupData[table] = data;
  }
  
  // Salvar backup no storage
  const fileName = `backup-${new Date().toISOString()}.json`;
  await supabase.storage
    .from('backups')
    .upload(fileName, JSON.stringify(backupData));
};
```

---

## 📊 Performance

### **Otimizações Implementadas**
- Lazy loading de componentes pesados
- Paginação em todas as listas
- Cache de dados frequentemente acessados
- Debounce em buscas
- Virtualização de listas grandes
- Compressão de imagens
- CDN para assets estáticos

### **Monitoramento**
```typescript
// Métricas de performance
const trackPerformance = (action: string, duration: number) => {
  console.log(`Admin Action: ${action} - Duration: ${duration}ms`);
  
  // Enviar para analytics (futuro)
  analytics.track('admin_action', {
    action,
    duration,
    user_id: currentUser.id
  });
};
```

---

**Última atualização**: Janeiro 2025 