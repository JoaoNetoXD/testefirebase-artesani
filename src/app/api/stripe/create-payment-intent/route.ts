import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/services/stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido' },
        { status: 400 }
      );
    }

    const { clientSecret, paymentIntentId } = await createPaymentIntent(amount);

    return NextResponse.json({
      clientSecret,
      paymentIntentId,
    });
  } catch (error) {
    console.error('Erro na API create-payment-intent:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}