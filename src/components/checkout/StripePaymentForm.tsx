
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
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function PaymentForm({ clientSecret, amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        const errorMessage = submitError.message || 'Erro ao processar dados do pagamento';
        setError(errorMessage);
        onError(errorMessage); // Notificar o componente pai sobre o erro
        setIsLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success?payment_intent_id={payment_intent}`, // Adicionar payment_intent_id para rastreamento
        },
        redirect: 'if_required', // Evita redirecionamento automático, lidamos com isso
      });

      if (confirmError) {
        const errorMessage = confirmError.message || 'Erro ao confirmar pagamento';
        setError(errorMessage);
        onError(errorMessage);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        // Caso o status não seja 'succeeded' mesmo sem erro direto (ex: requires_action)
        const errorMessage = paymentIntent?.status ? `Pagamento requer ação adicional: ${paymentIntent.status}` : 'Pagamento não concluído';
        setError(errorMessage);
        onError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro inesperado ao processar pagamento';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button
        type="submit"
        disabled={!stripe || isLoading}
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
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripePaymentForm({ amount, onSuccess, onError }: StripePaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingClientSecret, setIsLoadingClientSecret] = useState(true); // Renomeado para clareza

  useEffect(() => {
    // Função para criar o Payment Intent
    const createPaymentIntentOnMount = async () => {
      setIsLoadingClientSecret(true); // Inicia carregamento
      try {
        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }), // Envia o valor do carrinho
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          onError('Erro ao inicializar pagamento: clientSecret não recebido.');
        }
      } catch (error: any) {
        console.error("Erro ao criar Payment Intent:", error);
        onError(error.message || 'Erro ao conectar com o servidor de pagamento.');
      } finally {
        setIsLoadingClientSecret(false); // Finaliza carregamento
      }
    };

    if (amount > 0) { // Apenas tenta criar se o valor for positivo
        createPaymentIntentOnMount();
    } else {
        onError('Valor do carrinho inválido para iniciar pagamento.');
        setIsLoadingClientSecret(false);
    }
  // A dependência `amount` garante que o PI seja recriado se o valor mudar.
  // `onError` também como dependência se sua referência puder mudar.
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

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Erro ao carregar formulário de pagamento. Verifique o console para mais detalhes ou tente atualizar a página.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Opções para o componente Elements do Stripe
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#012A1A', // Cor primária do seu tema (Deep Green)
        colorBackground: '#ffffff', // Fundo branco dos inputs
        colorText: '#0B2918', // Texto escuro nos inputs
        colorDanger: '#ef4444', // Vermelho para erros
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '0.5rem', // Corresponde ao --radius
      },
      rules: {
        '.Input': {
          borderColor: 'hsl(var(--border))', // Cor da borda do input do seu tema
        }
      }
    },
    locale: 'pt-BR' as const,
  };

  return (
    <Card className="shadow-lg"> {/* Adicionando sombra para consistência */}
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline"> {/* Ajuste de estilo */}
          <CreditCard className="mr-3 h-5 w-5 text-primary" /> {/* Ajuste de tamanho e margem */}
          Pagamento com Cartão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            clientSecret={clientSecret}
            amount={amount}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}
