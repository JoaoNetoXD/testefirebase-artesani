import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { OrderService } from '@/lib/services/orderService';
import { supabase } from '@/lib/supabase';

// Criar a instância do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
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
        
        // Buscar pedido pelo payment_intent_id
        if (supabase) {
          const { data: orders } = await supabase
            .from('orders')
            .select('id')
            .eq('payment_intent_id', paymentIntent.id)
            .limit(1);
          
          if (orders && orders.length > 0) {
            await OrderService.updateOrderStatus(orders[0].id, 'processing');
            await OrderService.updateOrder(orders[0].id, { 
              payment_status: 'paid' 
            });
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Pagamento falhou:', failedPayment.id);
        
        // Marcar pedido como falhou
        if (supabase) {
          const { data: orders } = await supabase
            .from('orders')
            .select('id')
            .eq('payment_intent_id', failedPayment.id)
            .limit(1);
          
          if (orders && orders.length > 0) {
            await OrderService.updateOrderStatus(orders[0].id, 'cancelled');
            await OrderService.updateOrder(orders[0].id, { 
              payment_status: 'failed' 
            });
          }
        }
        break;

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        
        // Processar pedido completo
        if (supabase) {
          const { data: orders } = await supabase
            .from('orders')
            .select('id')
            .eq('stripe_session_id', session.id)
            .limit(1);
          
          if (orders && orders.length > 0) {
            await OrderService.updateOrderStatus(orders[0].id, 'processing');
            await OrderService.updateOrder(orders[0].id, { 
              payment_status: 'paid',
              payment_intent_id: session.payment_intent as string
            });
          } else if (session.metadata?.orderId) {
            // Fallback usando metadata
            await OrderService.updateOrderStatus(session.metadata.orderId, 'processing');
            await OrderService.updateOrder(session.metadata.orderId, { 
              payment_status: 'paid',
              payment_intent_id: session.payment_intent as string
            });
          }
        }
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