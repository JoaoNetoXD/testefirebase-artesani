# 🔌 APIs e Integrações

## 📋 Visão Geral

A aplicação Artesani utiliza APIs REST para comunicação entre frontend e backend, com integrações externas para pagamentos (Stripe) e armazenamento (Supabase). Todas as APIs seguem padrões RESTful e retornam dados em formato JSON.

---

## 🏗️ Estrutura de APIs

### **Localização**
- **APIs internas**: `src/app/api/`
- **Serviços**: `src/lib/services/`
- **Tipos**: `src/lib/types.ts`

---

## 💳 APIs do Stripe

### **1. Create Payment Intent**
```typescript
// POST /api/stripe/create-payment-intent
// Localização: src/app/api/stripe/create-payment-intent/route.ts

// Request Body
interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string; // default: 'brl'
  metadata?: Record<string, string>;
}

// Response
interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

// Exemplo de uso
const response = await fetch('/api/stripe/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 99.90,
    metadata: { orderId: 'order_123' }
  })
});
```

### **2. Create Checkout Session**
```typescript
// POST /api/stripe/create-checkout-session
// Localização: src/app/api/stripe/create-checkout-session/route.ts

// Request Body
interface CreateCheckoutSessionRequest {
  items: CartItem[];
  successUrl?: string;
  cancelUrl?: string;
}

// Response
interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// Exemplo de uso
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cartItems,
    successUrl: `${window.location.origin}/success`,
    cancelUrl: `${window.location.origin}/checkout`
  })
});
```

### **3. Webhook Handler**
```typescript
// POST /api/stripe/webhook
// Localização: src/app/api/stripe/webhook/route.ts

// Eventos processados:
- payment_intent.succeeded
- payment_intent.payment_failed
- checkout.session.completed
- payment_intent.requires_action

// Headers necessários:
- stripe-signature: assinatura do webhook

// Resposta padrão:
{ "received": true }
```

---

## 🗄️ Serviços de Dados

### **ProductService**
```typescript
// Localização: src/lib/services/productService.ts

class ProductService {
  // Buscar todos os produtos
  static async getAllProducts(includeArchived = false): Promise<Product[]>
  
  // Buscar produto por slug
  static async getProductBySlug(slug: string): Promise<Product | null>
  
  // Buscar produto por ID
  static async getProductById(id: string): Promise<Product | null>
  
  // Buscar produtos por categoria
  static async getProductsByCategory(categoryId: string): Promise<Product[]>
  
  // Buscar produtos (com filtros)
  static async searchProducts(searchTerm: string): Promise<Product[]>
  
  // Criar produto (admin)
  static async createProduct(productData: Partial<Product>): Promise<Product | null>
  
  // Atualizar produto (admin)
  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null>
  
  // Arquivar produto (admin)
  static async archiveProduct(id: string): Promise<boolean>
  
  // Deletar produto (admin)
  static async deleteProduct(id: string): Promise<{ success: boolean; message: string }>
}

// Exemplo de uso
const products = await ProductService.getAllProducts();
const product = await ProductService.getProductBySlug('vitamina-c-1000mg');
```

### **CategoryService**
```typescript
// Localização: src/lib/services/categoryService.ts

class CategoryService {
  // Buscar todas as categorias
  static async getAllCategories(): Promise<Category[]>
  
  // Buscar categoria por slug
  static async getCategoryBySlug(slug: string): Promise<Category | null>
  
  // Criar categoria (admin)
  static async createCategory(categoryData: Omit<Category, 'id' | 'created_at'>): Promise<Category | null>
  
  // Atualizar categoria (admin)
  static async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category | null>
  
  // Deletar categoria (admin)
  static async deleteCategory(id: string): Promise<boolean>
}

// Exemplo de uso
const categories = await CategoryService.getAllCategories();
const category = await CategoryService.getCategoryBySlug('manipulados');
```

### **CartService**
```typescript
// Localização: src/lib/services/cartService.ts

class CartService {
  // Buscar itens do carrinho
  static async getCartItems(userId: string): Promise<CartItem[]>
  
  // Adicionar item ao carrinho
  static async addToCart(userId: string, productId: string, quantity: number): Promise<void>
  
  // Atualizar quantidade
  static async updateQuantity(userId: string, productId: string, quantity: number): Promise<void>
  
  // Remover item do carrinho
  static async removeFromCart(userId: string, productId: string): Promise<void>
  
  // Limpar carrinho
  static async clearCart(userId: string): Promise<void>
  
  // Migrar carrinho local
  static async migrateLocalCart(userId: string, localItems: CartItem[]): Promise<void>
}

// Exemplo de uso
const cartItems = await CartService.getCartItems(userId);
await CartService.addToCart(userId, productId, 2);
```

### **OrderService**
```typescript
// Localização: src/lib/services/orderService.ts

class OrderService {
  // Buscar pedidos do usuário
  static async getUserOrders(userId: string): Promise<Order[]>
  
  // Buscar pedido por ID
  static async getOrderById(orderId: string): Promise<Order | null>
  
  // Criar pedido
  static async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null>
  
  // Atualizar status do pedido
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean>
  
  // Buscar todos os pedidos (admin)
  static async getAllOrders(): Promise<Order[]>
  
  // Estatísticas de pedidos (admin)
  static async getOrderStatistics(): Promise<DashboardStats>
}

// Exemplo de uso
const orders = await OrderService.getUserOrders(userId);
const order = await OrderService.createOrder(orderData);
```

### **FavoritesService**
```typescript
// Localização: src/lib/services/favoritesService.ts

class FavoritesService {
  // Buscar favoritos do usuário
  static async getUserFavorites(userId: string): Promise<Product[]>
  
  // Adicionar aos favoritos
  static async addToFavorites(userId: string, productId: string): Promise<void>
  
  // Remover dos favoritos
  static async removeFromFavorites(userId: string, productId: string): Promise<void>
  
  // Verificar se é favorito
  static async isFavorite(userId: string, productId: string): Promise<boolean>
}

// Exemplo de uso
const favorites = await FavoritesService.getUserFavorites(userId);
await FavoritesService.addToFavorites(userId, productId);
```

---

## 🔐 Autenticação e Autorização

### **Headers de Autenticação**
```typescript
// Para APIs que requerem autenticação
const headers = {
  'Authorization': `Bearer ${supabase.auth.session()?.access_token}`,
  'Content-Type': 'application/json'
};
```

### **Middleware de Autenticação**
```typescript
// Verificação automática via Supabase RLS
// Não é necessário middleware manual
// O Supabase gerencia automaticamente via políticas RLS
```

---

## 📝 Padrões de Request/Response

### **Estrutura Padrão de Resposta**
```typescript
// Sucesso
interface SuccessResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Erro
interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  details?: any;
}
```

### **Códigos de Status HTTP**
```typescript
// Códigos utilizados
200 - OK (sucesso)
201 - Created (recurso criado)
400 - Bad Request (dados inválidos)
401 - Unauthorized (não autenticado)
403 - Forbidden (sem permissão)
404 - Not Found (recurso não encontrado)
500 - Internal Server Error (erro interno)
```

### **Tratamento de Erros**
```typescript
// Padrão de tratamento
try {
  const response = await fetch('/api/endpoint');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro na requisição');
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Erro na API:', error);
  toast({
    title: "Erro",
    description: error.message,
    variant: "destructive"
  });
}
```

---

## 🚀 Performance e Otimização

### **Cache Strategy**
```typescript
// Cache de dados estáticos (categorias)
const categories = await CategoryService.getAllCategories();
// Cache automático via React Query ou SWR (futuro)

// Cache de produtos por categoria
const cacheKey = `products_category_${categoryId}`;
```

### **Paginação**
```typescript
// Implementação de paginação
interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// Exemplo de uso
const products = await ProductService.getProducts({
  page: 1,
  limit: 20,
  orderBy: 'created_at',
  orderDirection: 'desc'
});
```

### **Rate Limiting**
```typescript
// Implementado via Supabase
// Limite padrão: 100 requests/minute por IP
// Configurável via dashboard do Supabase
```

---

## 🔄 Integrações Externas

### **Supabase**
```typescript
// Configuração
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cliente
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(supabaseUrl, supabaseKey);

// Operações principais
- Auth: supabase.auth
- Database: supabase.from('table')
- Storage: supabase.storage
- Realtime: supabase.channel()
```

### **Stripe**
```typescript
// Configuração
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Cliente servidor
import Stripe from 'stripe';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-05-28.basil'
});

// Cliente frontend
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(stripePublishableKey);
```

---

## 🧪 Testes de API

### **Ferramentas Recomendadas**
- **Postman**: Testes manuais
- **Jest**: Testes unitários
- **Supertest**: Testes de integração

### **Exemplos de Teste**
```typescript
// Teste de criação de produto
describe('ProductService', () => {
  test('should create product successfully', async () => {
    const productData = {
      name: 'Teste Produto',
      description: 'Descrição teste',
      price: 29.99,
      stock: 10,
      category_id: 'category-id'
    };
    
    const product = await ProductService.createProduct(productData);
    
    expect(product).toBeDefined();
    expect(product.name).toBe(productData.name);
  });
});
```

---

## 📊 Monitoramento

### **Logs de API**
```typescript
// Estrutura de log
console.log('API Request:', {
  method: 'POST',
  endpoint: '/api/products',
  userId: user?.id,
  timestamp: new Date().toISOString(),
  data: requestData
});
```

### **Métricas Importantes**
- Tempo de resposta das APIs
- Taxa de erro por endpoint
- Volume de requisições
- Uso de recursos (CPU, memória)
- Taxa de sucesso de pagamentos

---

## 🔧 Configurações

### **Variáveis de Ambiente**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
NEXT_PUBLIC_BASE_URL=http://localhost:9002
```

### **Timeouts e Limites**
```typescript
// Configurações de timeout
const API_TIMEOUT = 30000; // 30 segundos
const UPLOAD_TIMEOUT = 60000; // 60 segundos para uploads

// Limites de dados
const MAX_PRODUCTS_PER_REQUEST = 100;
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
```

---

## 🐛 Troubleshooting

### **Problemas Comuns**

1. **CORS Issues**
   ```typescript
   // Configuração no next.config.js
   module.exports = {
     async headers() {
       return [
         {
           source: '/api/(.*)',
           headers: [
             { key: 'Access-Control-Allow-Origin', value: '*' },
             { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' }
           ]
         }
       ];
     }
   };
   ```

2. **Timeout de Requests**
   ```typescript
   // Implementar retry logic
   const retryRequest = async (fn, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
       }
     }
   };
   ```

3. **Rate Limiting**
   ```typescript
   // Implementar debounce
   import { debounce } from 'lodash';
   
   const debouncedSearch = debounce(async (term) => {
     const results = await ProductService.searchProducts(term);
     setSearchResults(results);
   }, 300);
   ```

---

## 🎯 Boas Práticas

### **Segurança**
- ✅ Validar todos os inputs
- ✅ Sanitizar dados antes de salvar
- ✅ Usar HTTPS em produção
- ✅ Implementar rate limiting
- ✅ Não expor chaves secretas no frontend

### **Performance**
- ✅ Implementar cache quando apropriado
- ✅ Usar paginação para listas grandes
- ✅ Otimizar queries do banco
- ✅ Comprimir responses
- ✅ Implementar lazy loading

### **Manutenibilidade**
- ✅ Documentar todas as APIs
- ✅ Usar tipos TypeScript
- ✅ Implementar testes
- ✅ Seguir padrões de nomenclatura
- ✅ Manter logs estruturados

---

**Última atualização**: Janeiro 2025 