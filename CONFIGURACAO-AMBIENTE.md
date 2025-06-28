# Configuração de Ambiente - Artesani

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

### 1. Supabase (OBRIGATÓRIO)
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui
```

**Onde encontrar:**
- Acesse seu projeto no Supabase
- Vá em Settings → API
- Copie a URL do projeto e as chaves

### 2. Stripe (OBRIGATÓRIO para pagamentos)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua-chave-publica
STRIPE_SECRET_KEY=sk_test_sua-chave-secreta
STRIPE_WEBHOOK_SECRET=whsec_seu-webhook-secret
```

**Onde encontrar:**
- Acesse dashboard.stripe.com
- Para chaves: Developers → API keys
- Para webhook: Developers → Webhooks → Add endpoint

**Configuração do Webhook:**
- URL: `https://seu-dominio.com/api/stripe/webhook`
- Eventos a escutar:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`

### 3. Configurações da Aplicação
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Em produção: https://seu-dominio.com
NODE_ENV=development  # Em produção: production
```

### 4. Email (OPCIONAL - para notificações)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app  # Use senha de app, não a senha normal
```

**Para Gmail:**
1. Ative verificação em 2 etapas
2. Gere uma senha de app em: myaccount.google.com/apppasswords

### 5. Analytics (OPCIONAL)
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 6. Limites de Upload
```env
MAX_FILE_SIZE_MB=5
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

## Verificação da Configuração

Execute este comando para verificar se tudo está configurado:

```bash
npm run dev
```

Se houver erros, verifique:
1. ✅ Todas as variáveis obrigatórias estão definidas
2. ✅ As chaves do Supabase estão corretas
3. ✅ O projeto Supabase está ativo
4. ✅ As tabelas foram criadas no banco

## Configurações no Supabase

### 1. Authentication
- Vá em Authentication → Providers
- Ative "Email" como provider
- Configure:
  - Confirm email: ON (recomendado)
  - Secure email change: ON
  - Secure password change: ON

### 2. Storage
- O bucket `product-images` já foi criado via SQL
- Verifique em Storage → Buckets
- Deve estar como "Public bucket"

### 3. Email Templates (opcional)
- Vá em Authentication → Email Templates
- Personalize os templates em português

### 4. URL Configuration
- Vá em Authentication → URL Configuration
- Site URL: `https://seu-dominio.com`
- Redirect URLs: 
  - `https://seu-dominio.com/*`
  - `http://localhost:3000/*` (para desenvolvimento)

## Segurança

⚠️ **IMPORTANTE:**
- Nunca commite o arquivo `.env.local`
- Mantenha as chaves secretas seguras
- Use chaves diferentes para produção
- Rotacione as chaves periodicamente

## Troubleshooting

### Erro de autenticação Supabase
- Verifique se as chaves estão corretas
- Confirme que o projeto não está pausado

### Erro de pagamento Stripe
- Verifique se está usando chaves de teste em desenvolvimento
- Confirme que o webhook está configurado corretamente

### Imagens não carregam
- Verifique as políticas do bucket no Supabase
- Confirme que o usuário é admin

### Emails não são enviados
- Verifique as configurações SMTP
- Para Gmail, use senha de aplicativo, não a senha normal 