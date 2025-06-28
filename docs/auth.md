# 🔐 Sistema de Autenticação

## 📋 Visão Geral

O sistema de autenticação da Artesani é baseado no **Supabase Auth**, fornecendo uma solução robusta e segura para gerenciamento de usuários, sessões e controle de acesso.

---

## 🏗️ Arquitetura

### **Componentes Principais**

#### `AuthContext.tsx`
- **Localização**: `src/context/AuthContext.tsx`
- **Propósito**: Gerenciamento global do estado de autenticação
- **Funcionalidades**:
  - Controle de sessão do usuário
  - Gerenciamento de perfis de usuário
  - Verificação de roles (admin/user)
  - Notificações de status

#### `useAuth.ts`
- **Localização**: `src/hooks/useAuth.ts`
- **Propósito**: Hook customizado para acesso ao contexto de autenticação
- **Retorna**: Estado atual do usuário e funções de autenticação

---

## 🔄 Fluxos de Autenticação

### **1. Registro de Usuário**
```typescript
// Fluxo: register()
1. Validação de dados de entrada
2. Criação de conta no Supabase Auth
3. Inserção de perfil na tabela 'profiles'
4. Envio de email de confirmação (opcional)
5. Redirecionamento para home
6. Notificação de sucesso
```

### **2. Login de Usuário**
```typescript
// Fluxo: login()
1. Validação de credenciais
2. Autenticação via Supabase
3. Busca de perfil do usuário
4. Verificação de role (admin/user)
5. Atualização do estado global
6. Redirecionamento baseado em role
```

### **3. Logout**
```typescript
// Fluxo: logout()
1. Chamada para Supabase signOut()
2. Limpeza do estado local
3. Redirecionamento para login
4. Notificação de logout
```

### **4. Recuperação de Senha**
```typescript
// Fluxo: resetPassword()
1. Validação de email
2. Envio de link de recuperação
3. Notificação de email enviado
```

---

## 🗄️ Estrutura de Dados

### **Tabela: profiles**
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Interface: UserProfileData**
```typescript
interface UserProfileData {
  name: string;
  phone?: string;
  email?: string;
  role?: string;
}
```

---

## 🛡️ Segurança e Controle de Acesso

### **Row Level Security (RLS)**
```sql
-- Política para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### **Proteção de Rotas**
```typescript
// Exemplo de proteção de rota administrativa
useEffect(() => {
  if (!loading) {
    if (!currentUser) {
      router.push('/login?redirect=/admin');
    } else if (!isAdmin) {
      router.push('/');
    }
  }
}, [currentUser, loading, isAdmin, router]);
```

---

## 🎨 Componentes de UI

### **Páginas de Autenticação**
- **Login**: `src/app/(auth)/login/page.tsx`
- **Registro**: `src/app/(auth)/register/page.tsx`
- **Recuperação**: `src/app/(auth)/forgot-password/page.tsx`

### **Layout Especial**
```typescript
// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
```

---

## 🔧 Configuração

### **Variáveis de Ambiente**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Configuração do Supabase**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## 🚨 Tratamento de Erros

### **Tipos de Erro Comuns**
```typescript
// Mapeamento de erros do Supabase
const errorMessages = {
  'Invalid login credentials': 'Email ou senha incorretos',
  'Email not confirmed': 'Email não confirmado',
  'Too many requests': 'Muitas tentativas. Tente novamente em alguns minutos',
  'User already registered': 'Usuário já cadastrado'
};
```

### **Notificações de Erro**
```typescript
// Uso do sistema de toast para notificações
toast({
  title: "Erro no Login",
  description: errorMessage,
  variant: "destructive"
});
```

---

## 📱 Estados de Loading

### **Indicadores Visuais**
```typescript
// Estado de carregamento durante autenticação
{loading && (
  <div className="flex items-center space-x-2">
    <Loader2 className="h-5 w-5 animate-spin" />
    <span>Carregando...</span>
  </div>
)}
```

---

## 🔄 Sincronização de Estado

### **Listener de Mudanças de Auth**
```typescript
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      setSession(session);
      const user = session?.user ?? null;
      setCurrentUser(user);
      
      if (user) {
        const profile = await fetchUserProfile(user.id);
        setCurrentUserProfile(profile);
        setIsAdmin(profile?.role === 'admin');
      } else {
        setCurrentUserProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    }
  );

  return () => {
    authListener?.subscription.unsubscribe();
  };
}, []);
```

---

## 🎯 Boas Práticas

### **Segurança**
- ✅ Sempre validar dados no frontend e backend
- ✅ Usar HTTPS em produção
- ✅ Implementar rate limiting
- ✅ Validar tokens de sessão
- ✅ Não expor informações sensíveis

### **UX/UI**
- ✅ Feedback visual para todas as ações
- ✅ Estados de loading claros
- ✅ Mensagens de erro amigáveis
- ✅ Redirecionamento intuitivo
- ✅ Lembrar estado de login

### **Performance**
- ✅ Lazy loading de componentes de auth
- ✅ Cache de perfil do usuário
- ✅ Otimização de re-renders
- ✅ Debounce em validações

---

## 🐛 Troubleshooting

### **Problemas Comuns**

1. **"Supabase client not initialized"**
   - Verificar variáveis de ambiente
   - Reiniciar servidor de desenvolvimento

2. **"Session expired"**
   - Implementar refresh automático de token
   - Redirecionar para login

3. **"Email not confirmed"**
   - Verificar configurações de email no Supabase
   - Implementar reenvio de confirmação

4. **Loading infinito**
   - Verificar listener de auth state
   - Garantir que loading seja definido como false

---

## 📊 Métricas e Monitoramento

### **Eventos para Tracking**
- Login bem-sucedido
- Falha de login
- Registro de novo usuário
- Logout
- Recuperação de senha
- Acesso a área administrativa

---

**Última atualização**: Janeiro 2025 