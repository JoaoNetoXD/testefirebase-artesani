import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/services/stripe';

export async function POST(request: NextRequest) {
  try {
    const { items, successUrl, cancelUrl } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Itens inválidos' },
        { status: 400 }
      );
    }

    const { sessionId, url } = await createCheckoutSession(
      items,
      successUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
      cancelUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`
    );

    return NextResponse.json({
      sessionId,
      url,
    });
  } catch (error) {
    console.error('Erro na API create-checkout-session:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}