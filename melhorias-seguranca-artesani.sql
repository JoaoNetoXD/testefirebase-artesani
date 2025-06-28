-- =====================================================
-- MELHORIAS DE SEGURANÇA E CONFIGURAÇÕES ADICIONAIS
-- Execute após o setup-final-artesani.sql
-- =====================================================

-- 1. FUNÇÃO PARA VALIDAR EMAIL
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. ADICIONAR CONSTRAINTS DE VALIDAÇÃO
ALTER TABLE profiles 
  ADD CONSTRAINT valid_email CHECK (is_valid_email(email));

ALTER TABLE profiles
  ADD CONSTRAINT valid_phone CHECK (phone ~ '^\+?[0-9\s\-\(\)]+$' OR phone IS NULL);

ALTER TABLE products
  ADD CONSTRAINT positive_price CHECK (price > 0);

ALTER TABLE orders
  ADD CONSTRAINT valid_payment_method CHECK (
    payment_method IS NULL OR 
    payment_method IN ('credit_card', 'debit_card', 'pix', 'boleto')
  );

-- 3. FUNÇÃO PARA HASH DE DADOS SENSÍVEIS (útil para logs)
CREATE OR REPLACE FUNCTION mask_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
  IF data IS NULL OR LENGTH(data) < 4 THEN
    RETURN '****';
  END IF;
  RETURN LEFT(data, 2) || REPEAT('*', LENGTH(data) - 4) || RIGHT(data, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. VIEW SEGURA PARA CLIENTES (esconde dados sensíveis)
CREATE OR REPLACE VIEW customer_orders_view AS
SELECT 
  o.id,
  o.user_id,
  o.total,
  o.status,
  o.payment_method,
  mask_sensitive_data(o.payment_intent_id) as masked_payment_id,
  o.created_at,
  p.name as customer_name,
  mask_sensitive_data(p.email) as masked_email
FROM orders o
JOIN profiles p ON o.user_id = p.id;

-- 5. FUNÇÃO PARA PREVENIR MÚLTIPLOS PEDIDOS SIMULTÂNEOS
CREATE OR REPLACE FUNCTION prevent_duplicate_orders()
RETURNS TRIGGER AS $$
DECLARE
  recent_order_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_order_count
  FROM orders
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - INTERVAL '1 minute'
    AND status = 'pending';
    
  IF recent_order_count > 0 THEN
    RAISE EXCEPTION 'Aguarde um momento antes de criar outro pedido';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_order_spam
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_orders();

-- 6. TABELA PARA TENTATIVAS DE LOGIN (SEGURANÇA)
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN DEFAULT false,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at DESC);

-- 7. FUNÇÃO PARA VERIFICAR LIMITE DE TENTATIVAS DE LOGIN
CREATE OR REPLACE FUNCTION check_login_rate_limit(
  p_email TEXT,
  p_ip_address TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  attempt_count INTEGER;
BEGIN
  -- Verifica tentativas por email nos últimos 15 minutos
  SELECT COUNT(*) INTO attempt_count
  FROM login_attempts
  WHERE email = p_email
    AND created_at > NOW() - INTERVAL '15 minutes'
    AND success = false;
    
  IF attempt_count >= 5 THEN
    RETURN false; -- Bloqueado
  END IF;
  
  -- Verifica tentativas por IP nos últimos 15 minutos
  SELECT COUNT(*) INTO attempt_count
  FROM login_attempts
  WHERE ip_address = p_ip_address
    AND created_at > NOW() - INTERVAL '15 minutes'
    AND success = false;
    
  IF attempt_count >= 10 THEN
    RETURN false; -- Bloqueado
  END IF;
  
  RETURN true; -- Permitido
END;
$$ LANGUAGE plpgsql;

-- 8. FUNÇÃO PARA LIMPAR DADOS ANTIGOS (LGPD/GDPR)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Remove logs de login antigos (mais de 90 dias)
  DELETE FROM login_attempts
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Remove logs de atividade antigos (mais de 1 ano)
  DELETE FROM activity_logs
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Anonimiza pedidos antigos (mais de 3 anos)
  UPDATE orders
  SET shipping_address = jsonb_build_object(
    'city', shipping_address->>'city',
    'state', shipping_address->>'state',
    'country', 'Brasil'
  )
  WHERE created_at < NOW() - INTERVAL '3 years'
    AND shipping_address IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- 9. FUNÇÃO PARA VALIDAR CEP BRASILEIRO
CREATE OR REPLACE FUNCTION is_valid_cep(cep TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN cep ~ '^[0-9]{5}-?[0-9]{3}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10. TRIGGER PARA REGISTRAR ALTERAÇÕES EM PRODUTOS (AUDITORIA)
CREATE OR REPLACE FUNCTION log_product_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Registra apenas se houve mudança significativa
    IF OLD.price != NEW.price OR OLD.stock != NEW.stock OR OLD.is_active != NEW.is_active THEN
      INSERT INTO activity_logs (
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data
      ) VALUES (
        auth.uid(),
        TG_OP,
        'products',
        NEW.id,
        jsonb_build_object(
          'price', OLD.price,
          'stock', OLD.stock,
          'is_active', OLD.is_active
        ),
        jsonb_build_object(
          'price', NEW.price,
          'stock', NEW.stock,
          'is_active', NEW.is_active
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_product_changes
  AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION log_product_changes();

-- 11. CONFIGURAÇÃO DE TIMEOUT PARA SESSÕES
CREATE OR REPLACE FUNCTION check_session_timeout()
RETURNS void AS $$
BEGIN
  -- Esta função pode ser chamada periodicamente para limpar sessões antigas
  -- Implementação depende da estratégia de sessão do app
  NULL;
END;
$$ LANGUAGE plpgsql;

-- 12. VIEW PARA DASHBOARD ADMINISTRATIVO
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM products WHERE is_active = true) as active_products,
  (SELECT COUNT(*) FROM products WHERE stock < 10 AND is_active = true) as low_stock_products,
  (SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '24 hours') as orders_today,
  (SELECT SUM(total) FROM orders WHERE created_at > NOW() - INTERVAL '24 hours' AND status != 'cancelled') as revenue_today,
  (SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_customers_week,
  (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
  (SELECT COUNT(DISTINCT user_id) FROM orders) as total_customers,
  (SELECT AVG(total) FROM orders WHERE status = 'delivered') as average_order_value;

-- 13. ÍNDICES ADICIONAIS PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;

-- 14. FUNÇÃO PARA CALCULAR FRETE (EXEMPLO BÁSICO)
CREATE OR REPLACE FUNCTION calculate_shipping(
  p_cep TEXT,
  p_weight DECIMAL DEFAULT 1.0
) RETURNS DECIMAL AS $$
DECLARE
  base_price DECIMAL := 15.00;
  cep_prefix TEXT;
BEGIN
  IF NOT is_valid_cep(p_cep) THEN
    RETURN 0;
  END IF;
  
  cep_prefix := LEFT(REPLACE(p_cep, '-', ''), 2);
  
  -- Exemplo simplificado - ajustar conforme necessidade
  CASE 
    WHEN cep_prefix BETWEEN '01' AND '19' THEN -- São Paulo capital
      RETURN base_price;
    WHEN cep_prefix BETWEEN '20' AND '28' THEN -- Rio de Janeiro
      RETURN base_price + 5.00;
    ELSE
      RETURN base_price + 10.00;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- FIM DAS MELHORIAS DE SEGURANÇA
-- ===================================================== 