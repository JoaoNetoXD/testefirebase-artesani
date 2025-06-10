import { NextRequest, NextResponse } from 'next/server';
// Trocar:
// import { stripe } from '@/lib/services/stripe';

// Por:
import Stripe from 'stripe';

// E criar a instância localmente:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  // Se não há webhook secret configurado, retorna erro
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook não configurado' },
      { status: 400 }
    );
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

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

    // Processar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Pagamento bem-sucedido:', paymentIntent.id);
        // Aqui você pode atualizar o status do pedido no banco de dados
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Pagamento falhou:', failedPayment.id);
        // Aqui você pode marcar o pedido como falhou
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        // Processar pedido completo
        break;

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}