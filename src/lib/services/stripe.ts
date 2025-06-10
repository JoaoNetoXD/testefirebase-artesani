import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';
import { CartItem } from '../types';

// Função para obter a instância do Stripe no servidor
function getStripe() {
  if (typeof window !== 'undefined') {
    throw new Error('Stripe server instance should not be used on the client side');
  }
  
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined');
  }
  
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
}

// Inicializar Stripe no cliente
const getStripePromise = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
  }
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
};

export const stripePromise = getStripePromise();

// Função para criar Payment Intent
export async function createPaymentIntent(amount: number, currency: string = 'brl') {
  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Erro ao criar Payment Intent:', error);
    throw error;
  }
}

// Função para criar Checkout Session
export async function createCheckoutSession(items: CartItem[], successUrl: string, cancelUrl: string) {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            description: item.description,
            images: item.images,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      shipping_address_collection: {
        allowed_countries: ['BR'],
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Erro ao criar Checkout Session:', error);
    throw error;
  }
}

// Função para verificar status do pagamento
export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Erro ao buscar Payment Intent:', error);
    throw error;
  }
}