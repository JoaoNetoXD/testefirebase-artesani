-- =====================================================
-- COMPLEMENTOS ÚTEIS PARA O BANCO ARTESANI
-- Execute após o setup-final-artesani.sql
-- =====================================================

-- 1. FUNÇÃO PARA VALIDAR ESTOQUE NA COMPRA
CREATE OR REPLACE FUNCTION validate_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
  available_stock INTEGER;
BEGIN
  SELECT stock INTO available_stock 
  FROM products 
  WHERE id = NEW.product_id;
  
  IF available_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Estoque insuficiente. Disponível: %, Solicitado: %', available_stock, NEW.quantity;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_stock_before_order
  BEFORE INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION validate_stock_on_order();

-- 2. FUNÇÃO PARA ATUALIZAR ESTOQUE AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products 
    SET stock = stock - NEW.quantity 
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products 
    SET stock = stock + OLD.quantity 
    WHERE id = OLD.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_stock
  AFTER INSERT OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_order();

-- 3. VIEW PARA PRODUTOS COM ESTOQUE BAIXO
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.*,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock < 10 
  AND p.is_active = true
ORDER BY p.stock ASC;

-- 4. VIEW PARA PRODUTOS MAIS VENDIDOS
CREATE OR REPLACE VIEW top_selling_products AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.price,
  p.images,
  COUNT(DISTINCT oi.order_id) as times_ordered,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.quantity * oi.price) as total_revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status NOT IN ('cancelled', 'pending')
GROUP BY p.id, p.name, p.slug, p.price, p.images
ORDER BY total_quantity_sold DESC;

-- 5. FUNÇÃO PARA GERAR SLUG AUTOMÁTICO
CREATE OR REPLACE FUNCTION generate_product_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM products WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_slug
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION generate_product_slug();

-- 6. TABELA DE LOGS DE ATIVIDADE (OPCIONAL - AUDITORIA)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- 7. FUNÇÃO PARA CALCULAR TOTAL DO PEDIDO
CREATE OR REPLACE FUNCTION calculate_order_total()
RETURNS TRIGGER AS $$
DECLARE
  order_total DECIMAL(10,2);
BEGIN
  SELECT SUM(quantity * price) INTO order_total
  FROM order_items
  WHERE order_id = NEW.order_id;
  
  UPDATE orders 
  SET total = COALESCE(order_total, 0)
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_total
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION calculate_order_total();

-- 8. ÍNDICE PARA BUSCA TEXTUAL EM PRODUTOS
CREATE INDEX idx_products_search ON products 
USING gin(to_tsvector('portuguese', 
  COALESCE(name, '') || ' ' || 
  COALESCE(description, '') || ' ' || 
  COALESCE(ingredients, '') || ' ' || 
  COALESCE(tags, '')
));

-- 9. FUNÇÃO PARA BUSCA AVANÇADA DE PRODUTOS
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL(10,2),
  stock INTEGER,
  images TEXT[],
  category_name TEXT,
  slug TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.stock,
    p.images,
    c.name as category_name,
    p.slug,
    ts_rank(
      to_tsvector('portuguese', 
        COALESCE(p.name, '') || ' ' || 
        COALESCE(p.description, '') || ' ' || 
        COALESCE(p.ingredients, '') || ' ' || 
        COALESCE(p.tags, '')
      ),
      plainto_tsquery('portuguese', search_term)
    ) as relevance
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE 
    p.is_active = true AND
    to_tsvector('portuguese', 
      COALESCE(p.name, '') || ' ' || 
      COALESCE(p.description, '') || ' ' || 
      COALESCE(p.ingredients, '') || ' ' || 
      COALESCE(p.tags, '')
    ) @@ plainto_tsquery('portuguese', search_term)
  ORDER BY relevance DESC, p.name;
END;
$$ LANGUAGE plpgsql;

-- 10. ALGUNS PRODUTOS DE EXEMPLO (OPCIONAL)
DO $$
DECLARE
  cat_manipulados UUID;
  cat_cosmeticos UUID;
  cat_suplementos UUID;
BEGIN
  SELECT id INTO cat_manipulados FROM categories WHERE slug = 'manipulados';
  SELECT id INTO cat_cosmeticos FROM categories WHERE slug = 'cosmeticos';
  SELECT id INTO cat_suplementos FROM categories WHERE slug = 'suplementos';
  
  -- Produtos Manipulados
  INSERT INTO products (name, slug, description, price, stock, category_id, ingredients, intended_uses, tags, images) VALUES
  ('Minoxidil 5% Loção Capilar', 'minoxidil-5-locao-capilar', 'Loção capilar manipulada com Minoxidil 5% para tratamento de calvície', 89.90, 25, cat_manipulados, 'Minoxidil 5%, Álcool etílico, Propilenoglicol, Água purificada', 'Tratamento de alopecia androgenética', 'cabelo,calvície,minoxidil,manipulado', ARRAY['https://via.placeholder.com/400x400?text=Minoxidil+5%25']),
  ('Creme Anti-idade com Ácido Hialurônico', 'creme-anti-idade-acido-hialuronico', 'Creme facial manipulado com ácido hialurônico e vitamina C', 125.00, 15, cat_manipulados, 'Ácido hialurônico 1%, Vitamina C 10%, Base cremosa', 'Hidratação facial, redução de rugas', 'anti-idade,ácido hialurônico,vitamina c,facial', ARRAY['https://via.placeholder.com/400x400?text=Creme+Anti-idade']),
  ('Fórmula Emagrecedora Termogênica', 'formula-emagrecedora-termogenica', 'Cápsulas manipuladas com blend termogênico natural', 156.00, 30, cat_manipulados, 'Cafeína, Chá verde, Gengibre, Pimenta cayena', 'Auxiliar no processo de emagrecimento', 'emagrecedor,termogênico,natural,cápsulas', ARRAY['https://via.placeholder.com/400x400?text=Termogênico']);
  
  -- Produtos Cosméticos
  INSERT INTO products (name, slug, description, price, stock, category_id, intended_uses, tags, images) VALUES
  ('Protetor Solar FPS 60 Toque Seco', 'protetor-solar-fps-60-toque-seco', 'Protetor solar facial com toque seco e proteção UVA/UVB', 67.90, 50, cat_cosmeticos, 'Proteção solar diária para todos os tipos de pele', 'protetor solar,fps 60,toque seco,facial', ARRAY['https://via.placeholder.com/400x400?text=Protetor+Solar+FPS60']),
  ('Sérum Vitamina C 20%', 'serum-vitamina-c-20', 'Sérum facial com alta concentração de vitamina C estabilizada', 98.00, 20, cat_cosmeticos, 'Clareamento de manchas, uniformização do tom da pele', 'sérum,vitamina c,clareador,facial', ARRAY['https://via.placeholder.com/400x400?text=Sérum+Vitamina+C']),
  ('Máscara Capilar Hidratação Profunda', 'mascara-capilar-hidratacao-profunda', 'Máscara reconstrutora com queratina e óleos naturais', 45.90, 35, cat_cosmeticos, 'Hidratação e reconstrução capilar', 'máscara capilar,hidratação,queratina', ARRAY['https://via.placeholder.com/400x400?text=Máscara+Capilar']);
  
  -- Suplementos
  INSERT INTO products (name, slug, description, price, stock, category_id, ingredients, intended_uses, tags, images) VALUES
  ('Ômega 3 1000mg - 60 cápsulas', 'omega-3-1000mg-60-capsulas', 'Suplemento de Ômega 3 de alta pureza em cápsulas', 54.90, 40, cat_suplementos, 'Óleo de peixe concentrado (EPA e DHA)', 'Saúde cardiovascular e cerebral', 'ômega 3,suplemento,coração,cérebro', ARRAY['https://via.placeholder.com/400x400?text=Ômega+3']),
  ('Vitamina D3 2000UI - 30 cápsulas', 'vitamina-d3-2000ui-30-capsulas', 'Vitamina D3 em cápsulas para suplementação diária', 32.90, 60, cat_suplementos, 'Colecalciferol (Vitamina D3)', 'Fortalecimento ósseo e imunidade', 'vitamina d,vitamina d3,ossos,imunidade', ARRAY['https://via.placeholder.com/400x400?text=Vitamina+D3']),
  ('Colágeno Hidrolisado + Vitamina C', 'colageno-hidrolisado-vitamina-c', 'Colágeno em pó sabor frutas vermelhas com vitamina C', 78.00, 25, cat_suplementos, 'Colágeno hidrolisado, Vitamina C, Aroma natural', 'Saúde da pele, cabelos e unhas', 'colágeno,vitamina c,pele,cabelo,unhas', ARRAY['https://via.placeholder.com/400x400?text=Colágeno+Hidrolisado']);
END $$;

-- 11. FUNÇÃO PARA LIMPAR CARRINHO ABANDONADO
CREATE OR REPLACE FUNCTION clean_abandoned_carts()
RETURNS void AS $$
BEGIN
  DELETE FROM cart_items
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 12. CONFIGURAR POLÍTICA PARA ACTIVITY LOGS (SE CRIADO)
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs" ON activity_logs
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own logs" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FIM DOS COMPLEMENTOS
-- ===================================================== 