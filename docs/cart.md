# 🛒 Sistema de Carrinho de Compras

## 📋 Visão Geral

O sistema de carrinho da Artesani oferece uma experiência de compra fluida e persistente, com suporte tanto para usuários logados quanto anônimos, sincronização automática e gestão de estado otimizada.

---

## 🏗️ Arquitetura

### **Componentes Principais**

#### `CartContext.tsx`
- **Localização**: `src/context/CartContext.tsx`
- **Propósito**: Gerenciamento global do estado do carrinho
- **Funcionalidades**:
  - Persistência de dados (localStorage + database)
  - Sincronização automática entre dispositivos
  - Migração de carrinho anônimo para logado
  - Cálculos de totais em tempo real

#### `CartService.ts`
- **Localização**: `src/lib/services/cartService.ts`
- **Propósito**: Lógica de negócio e operações de banco de dados
- **Operações**: CRUD completo de itens do carrinho

#### `SideCart.tsx`
- **Localização**: `src/components/cart/SideCart.tsx`
- **Propósito**: Interface lateral do carrinho
- **Features**: Visualização rápida, edição de quantidades, checkout

---

## 🔄 Fluxos de Funcionamento

### **1. Usuário Anônimo**
```typescript
// Fluxo para usuários não logados
1. Adicionar produto → localStorage
2. Visualizar carrinho → leitura do localStorage
3. Modificar quantidades → atualização do localStorage
4. Login → migração automática para database
```

### **2. Usuário Logado**
```typescript
// Fluxo para usuários autenticados
1. Adicionar produto → database (cart_items)
2. Sincronização automática entre dispositivos
3. Persistência garantida
4. Backup em localStorage como fallback
```

### **3. Migração de Carrinho**
```typescript
// Processo automático durante login
1. Verificar localStorage
2. Se existem itens → migrar para database
3. Mesclar com carrinho existente (se houver)
4. Limpar localStorage
5. Atualizar estado global
```

---

## 🗄️ Estrutura de Dados

### **Tabela: cart_items**
```sql
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

### **Interface: CartItem**
```typescript
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: string[];
  description?: string;
  stock: number;
  category_id: string;
  slug: string;
}
```

### **Context Interface**
```typescript
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
}
```

---

## 🎨 Componentes de Interface

### **SideCart - Carrinho Lateral**
```typescript
// Funcionalidades principais
- Visualização de itens
- Edição de quantidades
- Remoção de produtos
- Cálculo de totais
- Botão de checkout
- Estados de loading
```

### **Indicadores Visuais**
```typescript
// Badge de quantidade no header
{cartItemCount > 0 && (
  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground">
    {cartItemCount}
  </span>
)}
```

### **Estados de Loading**
```typescript
// Durante operações de carrinho
{loading && (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin" />
    <span className="ml-2">Atualizando carrinho...</span>
  </div>
)}
```

---

## 💾 Persistência e Sincronização

### **LocalStorage (Usuários Anônimos)**
```typescript
// Estrutura no localStorage
{
  "artesaniCart": [
    {
      "id": "product_id",
      "name": "Nome do Produto",
      "price": 29.99,
      "quantity": 2,
      "images": ["url1", "url2"]
    }
  ]
}
```

### **Database (Usuários Logados)**
```typescript
// Operações principais
await CartService.addToCart(userId, productId, quantity);
await CartService.updateQuantity(userId, productId, newQuantity);
await CartService.removeFromCart(userId, productId);
await CartService.clearCart(userId);
```

### **Migração Automática**
```typescript
// Processo durante login
const migrateLocalCart = async (userId: string, localItems: CartItem[]) => {
  for (const item of localItems) {
    await CartService.addToCart(userId, item.id, item.quantity);
  }
  localStorage.removeItem('artesaniCart');
};
```

---

## 🧮 Cálculos e Validações

### **Totais em Tempo Real**
```typescript
// Cálculo automático de totais
const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
const totalPrice = cart.reduce((total, item) => {
  const price = item.product?.price || item.price || 0;
  return total + (price * item.quantity);
}, 0);
```

### **Validações de Estoque**
```typescript
// Verificação antes de adicionar
const addToCart = async (product: Product) => {
  const currentQuantity = cart.find(item => item.id === product.id)?.quantity || 0;
  
  if (currentQuantity >= product.stock) {
    toast({
      title: "Estoque insuficiente",
      description: "Quantidade máxima atingida",
      variant: "destructive"
    });
    return;
  }
  
  // Prosseguir com adição...
};
```

---

## 🔄 Estados e Operações

### **Adicionar ao Carrinho**
```typescript
const addToCart = async (product: Product) => {
  if (currentUser) {
    // Usuário logado - salvar no database
    setLoading(true);
    try {
      await CartService.addToCart(currentUser.id, product.id, 1);
      const updatedCart = await CartService.getCartItems(currentUser.id);
      setCart(updatedCart);
    } finally {
      setLoading(false);
    }
  } else {
    // Usuário anônimo - salvar no localStorage
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }
};
```

### **Atualizar Quantidade**
```typescript
const updateQuantity = async (productId: string, quantity: number) => {
  if (quantity <= 0) {
    return removeFromCart(productId);
  }
  
  if (currentUser) {
    setLoading(true);
    try {
      await CartService.updateQuantity(currentUser.id, productId, quantity);
      const updatedCart = await CartService.getCartItems(currentUser.id);
      setCart(updatedCart);
    } finally {
      setLoading(false);
    }
  } else {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }
};
```

---

## 🎨 Design Guidelines

> **⚠️ IMPORTANTE - Padrão de Design:**
> 
> **Mantenha sempre a consistência visual!**
> - Use as cores primárias da Artesani
> - Mantenha elementos centralizados e alinhados
> - Preserve a identidade visual estabelecida
> - Siga os padrões de posicionamento da página home

### **Cores do Carrinho**
- **Botões de ação**: Cor secondary (laranja/dourado)
- **Indicadores**: Cor accent para badges
- **Estados de erro**: Cor destructive
- **Background**: Tons neutros para contraste

---

## 🚨 Tratamento de Erros

### **Cenários de Erro**
```typescript
// Erro de rede
if (!navigator.onLine) {
  toast({
    title: "Sem conexão",
    description: "Verifique sua conexão e tente novamente",
    variant: "destructive"
  });
  return;
}

// Produto fora de estoque
if (product.stock <= 0) {
  toast({
    title: "Produto indisponível",
    description: "Este produto está temporariamente fora de estoque",
    variant: "destructive"
  });
  return;
}

// Erro de sincronização
catch (error) {
  console.error('Erro no carrinho:', error);
  toast({
    title: "Erro no carrinho",
    description: "Tente novamente em alguns instantes",
    variant: "destructive"
  });
}
```

---

## 📱 Responsividade

### **Mobile**
- Carrinho lateral com largura otimizada
- Botões de quantidade maiores para touch
- Scroll suave para listas longas
- Feedback visual para ações

### **Desktop**
- Carrinho lateral mais amplo
- Hover effects nos botões
- Tooltips informativos
- Atalhos de teclado

---

## ⚡ Otimizações de Performance

### **Debounce em Atualizações**
```typescript
// Evitar múltiplas chamadas de API
const debouncedUpdateQuantity = useCallback(
  debounce((productId: string, quantity: number) => {
    updateQuantity(productId, quantity);
  }, 500),
  []
);
```

### **Memoização de Cálculos**
```typescript
// Otimizar recálculos de totais
const totalPrice = useMemo(() => {
  return cart.reduce((total, item) => {
    const price = item.product?.price || item.price || 0;
    return total + (price * item.quantity);
  }, 0);
}, [cart]);
```

### **Lazy Loading**
```typescript
// Carregar componente apenas quando necessário
const SideCart = lazy(() => import('@/components/cart/SideCart'));
```

---

## 🧪 Testes e Validações

### **Cenários de Teste**
- ✅ Adicionar produto ao carrinho vazio
- ✅ Adicionar produto já existente (incrementar)
- ✅ Remover produto do carrinho
- ✅ Atualizar quantidade para zero (remover)
- ✅ Migração de carrinho anônimo para logado
- ✅ Sincronização entre dispositivos
- ✅ Persistência após logout/login
- ✅ Comportamento offline

---

## 🔧 Configurações

### **Limites e Validações**
```typescript
const CART_LIMITS = {
  MAX_ITEMS_PER_PRODUCT: 99,
  MAX_TOTAL_ITEMS: 100,
  MAX_CART_VALUE: 50000
};
```

### **Configurações de UI**
```typescript
const CART_CONFIG = {
  ANIMATION_DURATION: 300,
  AUTO_CLOSE_DELAY: 3000,
  DEBOUNCE_DELAY: 500
};
```

---

## 📊 Métricas e Analytics

### **Eventos para Tracking**
- Produto adicionado ao carrinho
- Produto removido do carrinho
- Quantidade atualizada
- Carrinho limpo
- Migração de carrinho
- Abandono de carrinho
- Tempo médio no carrinho

---

**Última atualização**: Janeiro 2025 