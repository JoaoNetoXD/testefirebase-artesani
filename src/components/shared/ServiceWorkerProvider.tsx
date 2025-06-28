'use client';

import { useEffect } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, showReload, updateServiceWorker } = useServiceWorker();
  const { toast, dismiss } = useToast();

  // Show update notification
  useEffect(() => {
    if (showReload) {
      toast({
        title: "Atualização disponível",
        description: "Uma nova versão do site está disponível.",
        action: (
          <Button 
            size="sm" 
            onClick={() => {
              updateServiceWorker();
              dismiss();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        ),
        duration: 10000, // Show for 10 seconds
      });
    }
    // Remove toast and dismiss from dependencies to prevent infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showReload, updateServiceWorker]);

  // Show offline/online status
  useEffect(() => {
    const handleOnline = () => {
      toast({
        title: "Conexão restaurada",
        description: "Você está novamente online!",
        action: (
          <Wifi className="h-4 w-4 text-green-500" />
        ),
        duration: 3000,
      });
    };

    const handleOffline = () => {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Algumas funcionalidades podem estar limitadas.",
        action: (
          <WifiOff className="h-4 w-4 text-orange-500" />
        ),
        duration: 5000,
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    // Remove toast from dependencies to prevent infinite re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {children}
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Modo Offline</span>
        </div>
      )}
    </>
  );
} 