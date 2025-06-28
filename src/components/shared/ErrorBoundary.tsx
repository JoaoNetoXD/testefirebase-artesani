'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to external service (if configured)
    // logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full bg-primary-foreground/5 border-primary-foreground/10">
            <CardHeader className="text-center">
              <div className="mx-auto bg-red-100 rounded-full p-3 w-fit mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">
                Ops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-red-50 p-4 rounded-lg text-sm">
                  <summary className="cursor-pointer font-medium text-red-800 mb-2">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <pre className="text-red-700 overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Voltar ao Início
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Se o problema persistir, entre em contato conosco.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 