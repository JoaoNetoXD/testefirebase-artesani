DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP VIEW IF EXISTS products_with_category CASCADE;
DROP VIEW IF EXISTS order_statistics CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_intent ON orders(payment_intent_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  
  IF user_role IS NULL OR user_role != 'admin' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" ON categories
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE USING (public.is_admin(auth.uid()));

CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all products" ON products
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items" ON order_items
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' 
    AND public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' 
    AND public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' 
    AND public.is_admin(auth.uid())
  );

CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

INSERT INTO categories (name, slug, description) VALUES
  ('Manipulados', 'manipulados', 'Medicamentos manipulados sob prescrição'),
  ('Cosméticos', 'cosmeticos', 'Produtos de beleza e cuidados pessoais'),
  ('Suplementos', 'suplementos', 'Vitaminas e suplementos alimentares')
ON CONFLICT (slug) DO NOTHING;

CREATE OR REPLACE VIEW products_with_category AS
SELECT 
  p.*,
  c.name as category_name,
  c.slug as category_slug
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;

CREATE OR REPLACE VIEW order_statistics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as average_order_value
FROM orders
WHERE status != 'cancelled'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC; 