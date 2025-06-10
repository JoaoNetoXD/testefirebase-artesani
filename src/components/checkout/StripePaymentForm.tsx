
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
  clientSecret: string | null; // Allow null for initial state or error
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
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
      onError(stripeErrorMsg); // Notificar o componente pai sobre o erro
    }
  }, [stripe, onError]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) { // Adicionado !clientSecret aqui também
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
        clientSecret: clientSecret, // Passar clientSecret explicitamente
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
        onSuccess();
      } else {
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
  
  if (error && !stripe) { // Se o erro for específico do Stripe não carregado
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
        disabled={!stripe || isLoading || !elements || !clientSecret} // Adicionado !elements e !clientSecret
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
        
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          onError('Erro ao inicializar pagamento: clientSecret não recebido.');
        }
      } catch (error: any) {
        console.error("Erro ao criar Payment Intent:", error);
        onError(error.message || 'Erro ao conectar com o servidor de pagamento.');
      } finally {
        setIsLoadingClientSecret(false); 
      }
    };

    if (amount > 0) { 
        createPaymentIntentOnMount();
    } else if (amount === 0 && cart.length > 0) { // Check if cart has items even if total is 0 (e.g. free items)
        // Handle free orders or scenarios where payment is not needed, or show specific message
        // For now, assuming payment intent is always needed if cart is not empty.
        // If amount is 0 for non-empty cart, could be error or special case.
        onError('O valor do carrinho é zero. Não é possível iniciar pagamento com valor zero via Stripe.');
        setIsLoadingClientSecret(false);
    } else if (cart.length === 0) { // Cart is actually empty
        onError('Carrinho vazio. Adicione itens para prosseguir.');
        setIsLoadingClientSecret(false);
    } else { // Amount is invalid (e.g. negative)
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

  if (!clientSecret && !isLoadingClientSecret) { // Exibir erro se clientSecret não foi obtido E não está mais carregando
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
  
  // Se clientSecret for null aqui, o Elements não deve ser renderizado ou configurado corretamente
  // Mas o bloco acima já deve ter retornado o erro.
  // Por segurança, podemos garantir que o options.clientSecret não seja null.
  // No entanto, o Stripe Elements espera uma string não vazia.

  const options = {
    clientSecret: clientSecret || '', // Use empty string if null, though Stripe might still complain. Better handled by not rendering Elements.
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
        {clientSecret ? ( // Apenas renderizar Elements se clientSecret existir
          <Elements stripe={stripePromise} options={{...options, clientSecret: clientSecret}}>
            <PaymentForm
              clientSecret={clientSecret}
              amount={amount}
              onSuccess={onSuccess}
              onError={onError}
            />
          </Elements>
        ) : (
          // Este bloco é um fallback, o erro principal deve ser mostrado pelo `if (!clientSecret && !isLoadingClientSecret)`
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

