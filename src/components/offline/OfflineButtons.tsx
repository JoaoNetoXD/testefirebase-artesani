'use client';

import { RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function OfflineButtons() {
  return (
    <div className="space-y-3">
      <Button 
        onClick={() => window.location.reload()} 
        className="w-full"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar Novamente
      </Button>
      
      <Button 
        variant="outline" 
        asChild
        className="w-full"
      >
        <Link href="/">
          <Home className="h-4 w-4 mr-2" />
          Ir para o Início
        </Link>
      </Button>
    </div>
  );
} 