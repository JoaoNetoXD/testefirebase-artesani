import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
}

export function useNotifications() {
  const { toast } = useToast();
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSupported: false,
    isSubscribed: false,
  });

  useEffect(() => {
    // Check if notifications are supported
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    const permission = isSupported ? Notification.permission : 'denied';
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission,
    }));

    if (isSupported) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
      }));
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission === 'granted') {
        toast({
          title: "Notificações ativadas!",
          description: "Você receberá notificações sobre ofertas e novidades.",
        });
        return true;
      } else {
        toast({
          title: "Permissão negada",
          description: "Você pode ativar as notificações nas configurações do navegador.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: "Erro",
        description: "Não foi possível solicitar permissão para notificações.",
        variant: "destructive",
      });
      return false;
    }
  }, [state.isSupported, toast]);

  const subscribe = useCallback(async () => {
    if (state.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Replace with your actual VAPID public key
      const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      
      if (!applicationServerKey) {
        console.warn('VAPID public key not configured');
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      setState(prev => ({ ...prev, isSubscribed: true }));
      
      toast({
        title: "Inscrição realizada!",
        description: "Você foi inscrito para receber notificações.",
      });

      return true;
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Erro na inscrição",
        description: "Não foi possível se inscrever para notificações.",
        variant: "destructive",
      });
      return false;
    }
  }, [state.permission, requestPermission, toast]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove subscription from server
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setState(prev => ({ ...prev, isSubscribed: false }));
      
      toast({
        title: "Inscrição cancelada",
        description: "Você não receberá mais notificações push.",
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a inscrição.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (state.permission === 'granted') {
      new Notification(title, {
        icon: '/images/icon-192x192.png',
        badge: '/images/icon-72x72.png',
        ...options,
      });
    }
  }, [state.permission]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    showNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 