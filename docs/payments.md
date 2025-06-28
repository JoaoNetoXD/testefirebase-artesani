# 💳 Sistema de Pagamentos

## 📋 Visão Geral

O sistema de pagamentos da Artesani é integrado com o **Stripe**, oferecendo processamento seguro de pagamentos com cartão de crédito, PIX e outras modalidades. A implementação segue as melhores práticas de segurança PCI DSS.

---

## 🏗️ Arquitetura

### **Componentes Principais**

#### `stripe.ts`
- **Localização**: `src/lib/services/stripe.ts`
- **Propósito**: Configuração e funções do Stripe
- **Funcionalidades**:
  - Configuração do cliente Stripe
  - Criação de Payment Intent
  - Criação de Checkout Session
  - Verificação de status de pagamento

#### `StripePaymentForm.tsx`
- **Localização**: `src/components/checkout/StripePaymentForm.tsx`
- **Propósito**: Interface de pagamento
- **Features**: Formulário seguro, validação, processamento

#### **APIs de Pagamento**
- `src/app/api/stripe/create-payment-intent/route.ts`
- `src/app/api/stripe/create-checkout-session/route.ts`
- `src/app/api/stripe/webhook/route.ts`

---

## 🔄 Fluxos de Pagamento

### **1. Payment Intent (Cartão)**
```typescript
// Fluxo direto com formulário customizado
1. Cliente preenche dados do cartão
2. Frontend cria Payment Intent via API
3. Stripe processa o pagamento
4. Confirmação em tempo real
5. Atualização do status do pedido
6. Redirecionamento para página de sucesso
```

### **2. Checkout Session (Hospedado)**
```typescript
// Fluxo com página do Stripe
1. Cliente escolhe produtos
2. Sistema cria Checkout Session
3. Redirecionamento para Stripe Checkout
4. Cliente completa pagamento
5. Webhook confirma pagamento
6. Redirecionamento para página de sucesso
```

### **3. Webhook Processing**
```typescript
// Processamento assíncrono de eventos
1. Stripe envia evento via webhook
2. Verificação de assinatura
3. Processamento do evento
4. Atualização do status do pedido
5. Notificação ao cliente (email)
```

---

## 🗄️ Estrutura de Dados

### **Payment Intent Response**
```typescript
interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}
```

### **Checkout Session Response**
```typescript
interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}
```

### **Webhook Event Types**
```typescript
// Eventos processados
- payment_intent.succeeded
- payment_intent.payment_failed
- checkout.session.completed
- payment_intent.requires_action
```

---

## 🔧 Configuração

### **Variáveis de Ambiente**
```env
# Chaves do Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs de redirecionamento
NEXT_PUBLIC_BASE_URL=https://artesani.com
```

### **Inicialização do Stripe**
```typescript
// Cliente (frontend)
import { loadStripe } from '@stripe/stripe-js';

const getStripePromise = () => {
  if (typeof window === 'undefined') return null;
  
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key not found');
    return null;
  }
  
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

export const stripePromise = getStripePromise();
```

```typescript
// Servidor (backend)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});
```

---

## 💰 Métodos de Pagamento

### **Cartão de Crédito**
```typescript
// Configuração de Payment Intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100), // Centavos
  currency: 'brl',
  automatic_payment_methods: {
    enabled: true,
  },
  metadata: {
    orderId: order.id,
    customerId: customer.id
  }
});
```

### **PIX (via Stripe)**
```typescript
// Configuração para PIX
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100),
  currency: 'brl',
  payment_method_types: ['card', 'boleto'], // PIX via parceiros
  metadata: {
    paymentMethod: 'pix'
  }
});
```

---

## 🎨 Interface de Pagamento

### **Formulário de Cartão**
```typescript
// Componente StripePaymentForm
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripePaymentForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    const cardElement = elements.getElement(CardElement);
    
    // Criar Payment Intent
    const { clientSecret } = await createPaymentIntent(amount);
    
    // Confirmar pagamento
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerName,
            email: customerEmail,
          },
        },
      }
    );
    
    if (error) {
      console.error('Erro no pagamento:', error);
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement
        options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
          },
        }}
      />
      <button type="submit" disabled={!stripe}>
        Pagar R$ {amount.toFixed(2)}
      </button>
    </form>
  );
};
```

---

## 🔒 Segurança

### **Validação de Webhooks**
```typescript
// Verificação de assinatura do webhook
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Erro na verificação do webhook:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }
  
  // Processar evento...
}
```

### **Tokenização de Cartões**
```typescript
// Nunca armazenar dados de cartão
// Usar apenas tokens do Stripe
const paymentMethod = await stripe.paymentMethods.create({
  type: 'card',
  card: {
    token: cardToken, // Token seguro do Stripe
  },
});
```

---

## 🚨 Tratamento de Erros

### **Tipos de Erro Comuns**
```typescript
// Mapeamento de erros do Stripe
const errorMessages = {
  'card_declined': 'Cartão recusado. Tente outro cartão.',
  'insufficient_funds': 'Saldo insuficiente.',
  'expired_card': 'Cartão expirado.',
  'incorrect_cvc': 'Código de segurança incorreto.',
  'processing_error': 'Erro no processamento. Tente novamente.',
  'rate_limit': 'Muitas tentativas. Aguarde alguns minutos.'
};

// Tratamento no frontend
if (error) {
  const message = errorMessages[error.code] || 'Erro no pagamento. Tente novamente.';
  toast({
    title: "Erro no Pagamento",
    description: message,
    variant: "destructive"
  });
}
```

### **Estados de Pagamento**
```typescript
// Estados possíveis
enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action'
}
```

---

## 📱 Responsividade e UX

### **Design Guidelines**

> **⚠️ IMPORTANTE - Padrão de Design:**
> 
> **Mantenha sempre a consistência visual!**
> - Use as cores primárias da Artesani
> - Mantenha formulários centralizados e alinhados
> - Preserve a identidade visual estabelecida
> - Siga os padrões de posicionamento da página home

### **Estados Visuais**
```typescript
// Loading durante processamento
{isProcessing && (
  <div className="flex items-center justify-center">
    <Loader2 className="h-6 w-6 animate-spin mr-2" />
    <span>Processando pagamento...</span>
  </div>
)}

// Sucesso
{paymentSucceeded && (
  <div className="text-center text-green-600">
    <CheckCircle className="h-12 w-12 mx-auto mb-2" />
    <p>Pagamento realizado com sucesso!</p>
  </div>
)}
```

---

## 🔄 Integração com Pedidos

### **Criação de Pedido**
```typescript
// Fluxo completo de checkout
const processCheckout = async (cartItems: CartItem[]) => {
  try {
    // 1. Criar pedido no banco
    const order = await OrderService.createOrder({
      user_id: currentUser.id,
      items: cartItems,
      total: calculateTotal(cartItems),
      status: 'pending'
    });
    
    // 2. Criar Payment Intent
    const { clientSecret } = await createPaymentIntent(order.total);
    
    // 3. Confirmar pagamento
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
    
    if (!error && paymentIntent.status === 'succeeded') {
      // 4. Atualizar status do pedido
      await OrderService.updateOrderStatus(order.id, 'paid');
      
      // 5. Limpar carrinho
      await CartService.clearCart(currentUser.id);
      
      // 6. Redirecionar para sucesso
      router.push(`/success?order=${order.id}`);
    }
  } catch (error) {
    console.error('Erro no checkout:', error);
  }
};
```

---

## 📊 Webhooks e Eventos

### **Configuração de Webhooks**
```typescript
// Eventos monitorados
const WEBHOOK_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'checkout.session.completed',
  'invoice.payment_succeeded',
  'customer.subscription.created'
];
```

### **Processamento de Eventos**
```typescript
// Handler principal de webhooks
export async function POST(request: NextRequest) {
  const event = await verifyWebhookSignature(request);
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
      
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
      
    default:
      console.log(`Evento não tratado: ${event.type}`);
  }
  
  return NextResponse.json({ received: true });
}
```

---

## 🧪 Testes

### **Cartões de Teste**
```typescript
// Cartões para desenvolvimento
const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  INSUFFICIENT_FUNDS: '4000000000009995',
  EXPIRED: '4000000000000069'
};
```

### **Cenários de Teste**
- ✅ Pagamento bem-sucedido
- ✅ Cartão recusado
- ✅ Saldo insuficiente
- ✅ Cartão expirado
- ✅ CVC incorreto
- ✅ Webhook delivery
- ✅ Timeout de rede
- ✅ Erro de validação

---

## 📈 Monitoramento

### **Métricas Importantes**
- Taxa de conversão de pagamentos
- Tempo médio de processamento
- Taxa de erro por tipo
- Abandono no checkout
- Volume de transações
- Chargebacks e disputas

### **Logs e Debugging**
```typescript
// Logging estruturado
console.log('Payment attempt:', {
  orderId: order.id,
  amount: order.total,
  paymentMethod: 'card',
  timestamp: new Date().toISOString()
});
```

---

## 🔧 Configurações Avançadas

### **Retry Logic**
```typescript
// Retry automático para falhas temporárias
const retryPayment = async (paymentIntent: string, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await stripe.paymentIntents.confirm(paymentIntent);
      return result;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};
```

---

**Última atualização**: Janeiro 2025 