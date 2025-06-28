# 🏥 Documentação Artesani - E-commerce Farmácia

## 📋 Visão Geral

A **Artesani** é uma plataforma de e-commerce completa para farmácia de manipulação, desenvolvida com tecnologias modernas e foco na experiência do usuário. A aplicação oferece um sistema completo de vendas online com gestão administrativa robusta.

### 🎯 Objetivo Principal

Fornecer uma solução digital completa para a **Farmácia Artesani** em Teresina-PI, permitindo:
- Vendas online de produtos manipulados, cosméticos e suplementos
- Gestão administrativa completa
- Experiência de compra otimizada para diferentes dispositivos
- Sistema de pagamentos seguro e integrado

---

## 🏗️ Arquitetura Técnica

### **Stack Principal**
- **Frontend**: Next.js 15.3.3 + React 18 + TypeScript
- **Estilização**: Tailwind CSS + Shadcn/ui
- **Backend**: Supabase (BaaS) - PostgreSQL + Auth
- **Pagamentos**: Stripe Integration
- **Deploy**: Netlify

### **Padrões de Arquitetura**
- **Component-Based Architecture**: Componentes reutilizáveis e modulares
- **Context Pattern**: Gerenciamento de estado global
- **Service Layer**: Separação de lógica de negócio
- **Type Safety**: TypeScript em toda aplicação
- **Mobile-First**: Design responsivo prioritário

---

## 📁 Estrutura de Módulos

### 🔐 [Autenticação](./auth.md)
Sistema completo de autenticação com Supabase Auth, incluindo registro, login, recuperação de senha e controle de acesso baseado em roles.

### 🛒 [Carrinho de Compras](./cart.md)
Sistema de carrinho persistente com suporte a usuários logados e anônimos, sincronização automática e gestão de estado.

### 💳 [Pagamentos](./payments.md)
Integração completa com Stripe para processamento de pagamentos, incluindo Payment Intent, Checkout Session e webhooks.

### 🗄️ [Banco de Dados](./database.md)
Estrutura do banco de dados Supabase PostgreSQL com todas as tabelas, relacionamentos e políticas de segurança.

### 🔌 [APIs](./api.md)
Documentação das rotas de API, endpoints e integrações externas.

### 👑 [Painel Administrativo](./admin.md)
Sistema de gestão administrativa com controle de produtos, categorias, pedidos e relatórios.

### 🎨 [Design System](./design.md)
Guia de estilo, componentes de UI e padrões de design utilizados na aplicação.

---

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase
- Conta Stripe (opcional para desenvolvimento)

### Instalação
```bash
# Clonar repositório
git clone [URL_DO_REPOSITORIO]
cd testefirebase-artesani-2

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais

# Iniciar desenvolvimento
npm run dev
```

### Scripts Disponíveis
- `npm run dev`: Servidor de desenvolvimento (porta 9002)
- `npm run build`: Build de produção
- `npm run start`: Servidor de produção
- `npm run lint`: Verificação de código
- `npm run typecheck`: Verificação de tipos

---

## 🎨 Design Guidelines

> **⚠️ IMPORTANTE - Padrão de Design:**
> 
> **Mantenha sempre a consistência visual da aplicação!** 
> - Não altere o design principal e padrão de cores estabelecido na página home
> - Mantenha todos os elementos bem centralizados e alinhados
> - Preserve a identidade visual da marca Artesani
> - Qualquer alteração deve seguir os padrões de posicionamento já estabelecidos

### Cores Principais
- **Primary**: Verde institucional da Artesani
- **Secondary**: Cor de destaque (laranja/dourado)
- **Background**: Tons neutros para contraste
- **Accent**: Cores de ação e interação

### Tipografia
- **Headline**: Inter (títulos e destaques)
- **Body**: Inter (texto corrido)
- **Code**: Source Code Pro (código)

---

## 📊 Funcionalidades Principais

### ✅ Implementadas
- [x] Sistema de autenticação completo
- [x] Catálogo de produtos com categorias
- [x] Carrinho de compras persistente
- [x] Sistema de favoritos
- [x] Integração com Stripe
- [x] Painel administrativo
- [x] Interface responsiva
- [x] Busca de produtos
- [x] Gestão de pedidos

### 🔄 Roadmap
- [ ] Sistema de avaliações
- [ ] Notificações push
- [ ] Chat de suporte
- [ ] Sistema de cupons
- [ ] Analytics avançado
- [ ] PWA (Progressive Web App)

---

## 🤝 Contribuição

### Padrões de Código
- Utilize TypeScript para type safety
- Siga os padrões ESLint configurados
- Mantenha componentes pequenos e reutilizáveis
- Documente funções complexas
- Teste alterações antes de commit

### Estrutura de Commits
```
tipo(escopo): descrição

feat(auth): adicionar login com Google
fix(cart): corrigir cálculo de total
docs(readme): atualizar documentação
```

---

## 📞 Suporte

Para dúvidas sobre a aplicação:
- Consulte a documentação específica de cada módulo
- Verifique os logs de erro no console
- Consulte a documentação do Supabase e Stripe
- Entre em contato com a equipe de desenvolvimento

---

## 📝 Licença

Este projeto é propriedade da **Farmácia Artesani** e está sob licença proprietária.

---

**Última atualização**: Janeiro 2025
**Versão da aplicação**: 0.1.0 