
"use client";
import { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard } from 'lucide-react';
import { stripePromise } from '@/lib/services/stripe';

interface PaymentFormProps {
  clientSecret: string | null;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  paymentIntentId?: string;
}

function PaymentForm({ clientSecret, amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      const stripeErrorMsg = "Stripe.js não pôde ser carregado. Verifique a configuração da chave publicável do Stripe.";
      setError(stripeErrorMsg);
      onError(stripeErrorMsg);
    }
  }, [stripe, onError]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError("Formulário de pagamento não está pronto ou o Stripe não foi carregado.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        const errorMessage = submitError.message || 'Erro ao processar dados do pagamento';
        setError(errorMessage);
        onError(errorMessage); 
        setIsLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/success?payment_intent_id={payment_intent}`, 
        },
        redirect: 'if_required', 
      });

      if (confirmError) {
        const errorMessage = confirmError.message || 'Erro ao confirmar pagamento';
        setError(errorMessage);
        onError(errorMessage);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        const errorMessage = paymentIntent?.status ? `Pagamento requer ação adicional: ${paymentIntent.status}` : 'Pagamento não concluído';
        setError(errorMessage);
        onError(errorMessage);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado ao processar pagamento';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (error && !stripe) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={
          {
            layout: 'tabs',
            paymentMethodOrder: ['card'],
          }
        }
      />
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button
        type="submit"
        disabled={!stripe || isLoading || !elements || !clientSecret}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pagar R$ {amount.toFixed(2).replace('.', ',')}
          </>
        )}
      </Button>
    </form>
  );
}

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
}

export default function StripePaymentForm({ amount, onSuccess, onError, customerInfo }: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [isLoadingClientSecret, setIsLoadingClientSecret] = useState(true); 

  useEffect(() => {
    const createPaymentIntentOnMount = async () => {
      setIsLoadingClientSecret(true); 
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }), 
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.clientSecret && data.paymentIntentId) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId);
        } else {
          onError('Erro ao inicializar pagamento: dados incompletos.');
        }
      } catch (error: unknown) {
        console.error("Erro ao criar Payment Intent:", error);
        const errorMessage = error instanceof Error ? error.message : 'Erro ao conectar com o servidor de pagamento.';
        onError(errorMessage);
      } finally {
        setIsLoadingClientSecret(false); 
      }
    };

    if (amount > 0) { 
        createPaymentIntentOnMount();
    } else {
        onError('Valor do carrinho inválido para iniciar pagamento.');
        setIsLoadingClientSecret(false);
    }
  }, [amount, onError]); 

  if (isLoadingClientSecret) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Carregando formulário de pagamento...
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret && !isLoadingClientSecret) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Não foi possível carregar o formulário de pagamento. 
              Verifique se o valor do pedido é válido e se há conexão com o servidor de pagamento. 
              Se o problema persistir, contate o suporte.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const options = {
    clientSecret: clientSecret || '',
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#012A1A', 
        colorBackground: '#ffffff', 
        colorText: '#0B2918', 
        colorDanger: '#ef4444', 
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '0.5rem', 
      },
      rules: {
        '.Input': {
          borderColor: 'hsl(var(--border))', 
        }
      }
    },
    locale: 'pt-BR' as const,
  };

  return (
    <Card className="shadow-lg"> 
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline"> 
          <CreditCard className="mr-3 h-5 w-5 text-primary" /> 
          Pagamento com Cartão
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clientSecret ? (
          <Elements stripe={stripePromise} options={{...options, clientSecret: clientSecret}}>
            <PaymentForm
              clientSecret={clientSecret}
              amount={amount}
              onSuccess={onSuccess}
              onError={onError}
              paymentIntentId={paymentIntentId || undefined}
            />
          </Elements>
        ) : (
          <Alert variant="destructive">
            <AlertDescription>
              Configuração de pagamento incompleta. O clientSecret é necessário.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
