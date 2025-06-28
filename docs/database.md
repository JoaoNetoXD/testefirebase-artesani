# 🗄️ Banco de Dados

## 📋 Visão Geral

O banco de dados da Artesani utiliza **PostgreSQL** via **Supabase**, oferecendo uma estrutura robusta e escalável com Row Level Security (RLS), triggers automáticos e políticas de acesso granulares.

---

## 🏗️ Estrutura Geral

### **Esquemas Principais**
- **public**: Tabelas da aplicação
- **auth**: Gerenciado pelo Supabase (usuários, sessões)
- **storage**: Arquivos e imagens

---

## 📊 Tabelas Principais

### **1. products**
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  ingredients TEXT,
  intended_uses TEXT,
  tags TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
```

### **2. categories**
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_categories_slug ON categories(slug);
```

### **3. profiles**
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
```

### **4. orders**
```sql
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  payment_method TEXT,
  payment_status TEXT,
  payment_intent_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_intent ON orders(payment_intent_id);
```

### **5. order_items**
```sql
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### **6. cart_items**
```sql
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Índices
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
```

### **7. favorites**
```sql
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Índices
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);
```

---

## 🔒 Row Level Security (RLS)

### **Políticas de Segurança**

#### **profiles**
```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin(auth.uid()));

-- Admins podem atualizar todos os perfis (se necessário)
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin(auth.uid()));
```

#### **cart_items**
```sql
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios itens
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem inserir em seu próprio carrinho
CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios itens
CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios itens
CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);
```

#### **orders**
```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios pedidos
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar pedidos para si mesmos
CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todos os pedidos
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (is_admin(auth.uid()));

-- Admins podem atualizar pedidos
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (is_admin(auth.uid()));
```

#### **products & categories**
```sql
-- Produtos e categorias são públicos para leitura
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Todos podem ver produtos ativos
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Admins podem ver todos os produtos
CREATE POLICY "Admins can view all products" ON products
  FOR SELECT USING (is_admin(auth.uid()));

-- Apenas admins podem modificar produtos
CREATE POLICY "Admins can modify products" ON products
  FOR ALL USING (is_admin(auth.uid()));

-- Todos podem ver categorias
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Apenas admins podem modificar categorias
CREATE POLICY "Admins can modify categories" ON categories
  FOR ALL USING (is_admin(auth.uid()));
```

---

## 🔄 Triggers e Funções

### **Função de Verificação de Admin**
```sql
-- Função para verificar se um usuário é admin de forma segura
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
DECLARE
  is_admin_user boolean;
BEGIN
  -- Usar SECURITY INVOKER para executar com as permissões do usuário que chama
  -- e desabilitar RLS temporariamente para esta consulta específica
  SET LOCAL bypass_rls = on;
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  ) INTO is_admin_user;
  RESET bypass_rls;
  RETURN is_admin_user;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

### **Atualização Automática de Timestamps**
```sql
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar a produtos
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Aplicar a perfis
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Aplicar a pedidos
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### **Criação Automática de Perfil**
```sql
-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### **Validação de Estoque**
```sql
-- Função para validar estoque em pedidos
CREATE OR REPLACE FUNCTION validate_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT stock FROM products WHERE id = NEW.product_id) < NEW.quantity THEN
    RAISE EXCEPTION 'Estoque insuficiente para o produto %', NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar estoque
CREATE TRIGGER validate_order_item_stock
  BEFORE INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION validate_stock_on_order();
```

---

## 📈 Views e Consultas Otimizadas

### **View: Produtos com Categoria**
```sql
CREATE VIEW products_with_category AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;
```

### **View: Estatísticas de Pedidos**
```sql
CREATE VIEW order_statistics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as average_order_value
FROM orders
WHERE status != 'cancelled'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

### **View: Produtos Mais Vendidos**
```sql
CREATE VIEW top_selling_products AS
SELECT 
  p.id,
  p.name,
  p.price,
  SUM(oi.quantity) as total_sold,
  SUM(oi.quantity * oi.price) as total_revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status IN ('processing', 'shipped', 'delivered')
GROUP BY p.id, p.name, p.price
ORDER BY total_sold DESC;
```

---

## 🔍 Consultas Comuns

### **Buscar Produtos**
```sql
-- Busca com filtros
SELECT p.*, c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE 
  p.is_active = true
  AND (
    p.name ILIKE '%termo%' 
    OR p.description ILIKE '%termo%'
    OR p.tags ILIKE '%termo%'
  )
  AND ($1::uuid IS NULL OR p.category_id = $1)
  AND ($2::decimal IS NULL OR p.price <= $2)
ORDER BY p.created_at DESC
LIMIT $3 OFFSET $4;
```

### **Carrinho do Usuário**
```sql
-- Itens do carrinho com detalhes do produto
SELECT 
  ci.id,
  ci.quantity,
  ci.created_at,
  p.id as product_id,
  p.name,
  p.price,
  p.images,
  p.stock,
  p.slug
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = $1
  AND p.is_active = true
ORDER BY ci.created_at DESC;
```

### **Pedidos do Cliente**
```sql
-- Pedidos com itens
SELECT 
  o.*,
  json_agg(
    json_build_object(
      'id', oi.id,
      'quantity', oi.quantity,
      'price', oi.price,
      'product', json_build_object(
        'id', p.id,
        'name', p.name,
        'images', p.images,
        'slug', p.slug
      )
    )
  ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC;
```

---

## 🗂️ Storage (Arquivos)

### **Configuração de Buckets**
```sql
-- Bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- Política para upload de imagens (apenas admins)
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política para visualização pública
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
```

---

## 📊 Monitoramento e Performance

### **Índices Importantes**
```sql
-- Índices compostos para consultas frequentes
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_order_items_order_product ON order_items(order_id, product_id);

-- Índices para busca textual
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('portuguese', name || ' ' || description || ' ' || COALESCE(tags, '')));
```

### **Estatísticas de Uso**
```sql
-- Query para monitorar performance
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;
```

---

## 🔧 Backup e Manutenção

### **Backup Automático**
- Supabase realiza backup automático diário
- Retenção de 7 dias no plano gratuito
- Point-in-time recovery disponível

### **Limpeza Periódica**
```sql
-- Limpar carrinho abandonado (30+ dias)
DELETE FROM cart_items 
WHERE created_at < NOW() - INTERVAL '30 days';

-- Arquivar pedidos antigos cancelados
UPDATE orders 
SET status = 'archived' 
WHERE status = 'cancelled' 
  AND created_at < NOW() - INTERVAL '1 year';
```

---

## 🐛 Troubleshooting

### **Problemas Comuns**

1. **RLS bloqueando consultas**
   ```sql
   -- Verificar políticas ativas
   SELECT * FROM pg_policies WHERE tablename = 'nome_da_tabela';
   ```

2. **Performance lenta**
   ```sql
   -- Analisar plano de execução
   EXPLAIN ANALYZE SELECT * FROM products WHERE name ILIKE '%termo%';
   ```

3. **Conflitos de constraint**
   ```sql
   -- Verificar constraints
   SELECT * FROM information_schema.table_constraints 
   WHERE table_name = 'nome_da_tabela';
   ```

---

## 📋 Checklist de Manutenção

### **Diário**
- [ ] Verificar logs de erro
- [ ] Monitorar performance de queries
- [ ] Verificar espaço em disco

### **Semanal**
- [ ] Analisar estatísticas de uso
- [ ] Verificar integridade dos dados
- [ ] Limpar dados temporários

### **Mensal**
- [ ] Revisar e otimizar índices
- [ ] Analisar crescimento do banco
- [ ] Atualizar estatísticas do PostgreSQL

---

**Última atualização**: Janeiro 2025 