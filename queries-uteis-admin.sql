-- =====================================================
-- QUERIES ÚTEIS PARA ADMINISTRADORES
-- Copie e cole conforme necessário
-- =====================================================

-- 1. TRANSFORMAR USUÁRIO EM ADMIN
UPDATE profiles SET role = 'admin' WHERE email = 'email@exemplo.com';

-- 2. VER TODOS OS ADMINISTRADORES
SELECT id, name, email, created_at 
FROM profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 3. PRODUTOS COM ESTOQUE BAIXO (menos de 10 unidades)
SELECT p.name, p.stock, c.name as categoria, p.price
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock < 10 AND p.is_active = true
ORDER BY p.stock ASC;

-- 4. PEDIDOS DO DIA
SELECT 
  o.id,
  p.name as cliente,
  o.total,
  o.status,
  o.payment_method,
  o.created_at
FROM orders o
JOIN profiles p ON o.user_id = p.id
WHERE DATE(o.created_at) = CURRENT_DATE
ORDER BY o.created_at DESC;

-- 5. RECEITA POR PERÍODO
SELECT 
  DATE(created_at) as data,
  COUNT(*) as total_pedidos,
  SUM(total) as receita_total,
  AVG(total) as ticket_medio
FROM orders
WHERE status NOT IN ('cancelled', 'pending')
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- 6. PRODUTOS MAIS VENDIDOS
SELECT 
  p.name,
  c.name as categoria,
  COUNT(DISTINCT oi.order_id) as num_pedidos,
  SUM(oi.quantity) as qtd_vendida,
  SUM(oi.quantity * oi.price) as receita_total
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE o.status NOT IN ('cancelled', 'pending')
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY p.id, p.name, c.name
ORDER BY qtd_vendida DESC
LIMIT 10;

-- 7. CLIENTES QUE MAIS COMPRARAM
SELECT 
  p.name,
  p.email,
  COUNT(o.id) as total_pedidos,
  SUM(o.total) as valor_total_gasto,
  AVG(o.total) as ticket_medio,
  MAX(o.created_at) as ultima_compra
FROM profiles p
JOIN orders o ON p.id = o.user_id
WHERE o.status NOT IN ('cancelled', 'pending')
GROUP BY p.id, p.name, p.email
ORDER BY valor_total_gasto DESC
LIMIT 20;

-- 8. PRODUTOS SEM IMAGEM
SELECT id, name, slug, stock, price
FROM products
WHERE (images IS NULL OR images = '{}')
  AND is_active = true;

-- 9. CARRINHO ABANDONADO (itens há mais de 7 dias)
SELECT 
  p.name as cliente,
  p.email,
  COUNT(ci.id) as qtd_itens,
  SUM(pr.price * ci.quantity) as valor_carrinho,
  MAX(ci.created_at) as ultimo_item_adicionado
FROM cart_items ci
JOIN profiles p ON ci.user_id = p.id
JOIN products pr ON ci.product_id = pr.id
WHERE ci.created_at < NOW() - INTERVAL '7 days'
GROUP BY p.id, p.name, p.email
ORDER BY valor_carrinho DESC;

-- 10. ESTATÍSTICAS GERAIS DO MÊS
SELECT 
  (SELECT COUNT(*) FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as pedidos_mes,
  (SELECT SUM(total) FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND status != 'cancelled') as receita_mes,
  (SELECT COUNT(*) FROM profiles WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as novos_clientes_mes,
  (SELECT COUNT(DISTINCT user_id) FROM orders WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as clientes_compraram_mes;

-- 11. PRODUTOS FAVORITOS MAIS POPULARES
SELECT 
  p.name,
  c.name as categoria,
  COUNT(f.id) as vezes_favoritado,
  p.stock,
  p.price
FROM favorites f
JOIN products p ON f.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true
GROUP BY p.id, p.name, c.name, p.stock, p.price
ORDER BY vezes_favoritado DESC
LIMIT 20;

-- 12. ANÁLISE DE CONVERSÃO (Favoritos -> Compras)
WITH favoritos_comprados AS (
  SELECT 
    f.product_id,
    COUNT(DISTINCT f.user_id) as usuarios_favoritaram,
    COUNT(DISTINCT oi.order_id) as vezes_comprado
  FROM favorites f
  LEFT JOIN order_items oi ON f.product_id = oi.product_id
  LEFT JOIN orders o ON oi.order_id = o.id AND o.user_id = f.user_id
  GROUP BY f.product_id
)
SELECT 
  p.name,
  fc.usuarios_favoritaram,
  fc.vezes_comprado,
  ROUND((fc.vezes_comprado::numeric / NULLIF(fc.usuarios_favoritaram, 0)) * 100, 2) as taxa_conversao_pct
FROM favoritos_comprados fc
JOIN products p ON fc.product_id = p.id
ORDER BY usuarios_favoritaram DESC;

-- 13. PEDIDOS PENDENTES HÁ MAIS DE 24 HORAS
SELECT 
  o.id,
  p.name as cliente,
  p.email,
  o.total,
  o.created_at,
  EXTRACT(hours FROM NOW() - o.created_at) as horas_pendente
FROM orders o
JOIN profiles p ON o.user_id = p.id
WHERE o.status = 'pending'
  AND o.created_at < NOW() - INTERVAL '24 hours'
ORDER BY o.created_at;

-- 14. BUSCAR PRODUTO POR NOME OU DESCRIÇÃO
SELECT * FROM search_products('vitamina c');

-- 15. LIMPAR CARRINHOS ABANDONADOS (mais de 30 dias)
SELECT clean_abandoned_carts();

-- 16. VER LOGS DE ATIVIDADE RECENTES
SELECT 
  al.created_at,
  p.name as usuario,
  al.action,
  al.table_name,
  al.old_data,
  al.new_data
FROM activity_logs al
LEFT JOIN profiles p ON al.user_id = p.id
ORDER BY al.created_at DESC
LIMIT 50;

-- 17. PRODUTOS POR CATEGORIA
SELECT 
  c.name as categoria,
  COUNT(p.id) as total_produtos,
  COUNT(CASE WHEN p.is_active THEN 1 END) as produtos_ativos,
  COUNT(CASE WHEN p.stock = 0 THEN 1 END) as sem_estoque,
  AVG(p.price) as preco_medio
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- 18. ANÁLISE DE HORÁRIO DE PICO DE VENDAS
SELECT 
  EXTRACT(hour FROM created_at) as hora_do_dia,
  COUNT(*) as total_pedidos,
  SUM(total) as receita_hora
FROM orders
WHERE status NOT IN ('cancelled', 'pending')
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY EXTRACT(hour FROM created_at)
ORDER BY hora_do_dia;

-- 19. VERIFICAR TENTATIVAS DE LOGIN SUSPEITAS
SELECT 
  email,
  COUNT(*) as tentativas_falhas,
  MAX(created_at) as ultima_tentativa,
  COUNT(DISTINCT ip_address) as ips_diferentes
FROM login_attempts
WHERE success = false
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY email
HAVING COUNT(*) >= 3
ORDER BY tentativas_falhas DESC;

-- 20. DASHBOARD RÁPIDO (copie o resultado para planilha)
SELECT * FROM admin_dashboard_stats;

-- =====================================================
-- FIM DAS QUERIES ÚTEIS
-- ===================================================== 