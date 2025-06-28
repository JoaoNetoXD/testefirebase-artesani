import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isOnline: boolean;
  isInstalled: boolean;
  waitingWorker: ServiceWorker | null;
  showReload: boolean;
}

export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInstalled: false,
    waitingWorker: null,
    showReload: false,
  });

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    async function registerSW() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Update available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({
                  ...prev,
                  waitingWorker: newWorker,
                  showReload: true,
                }));
              }
            });
          }
        });

        setState(prev => ({ ...prev, isInstalled: true }));
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }

    registerSW();
  }, []);

  // Online/offline status
  useEffect(() => {
    function handleOnline() {
      setState(prev => ({ ...prev, isOnline: true }));
    }

    function handleOffline() {
      setState(prev => ({ ...prev, isOnline: false }));
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update service worker
  const updateServiceWorker = () => {
    if (state.waitingWorker) {
      state.waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setState(prev => ({ ...prev, showReload: false }));
      window.location.reload();
    }
  };

  // Request push notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  return {
    ...state,
    updateServiceWorker,
    requestNotificationPermission,
  };
} 