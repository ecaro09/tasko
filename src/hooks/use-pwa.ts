import React from 'react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);
  const [showSplashScreen, setShowSplashScreen] = React.useState(true);

  React.useEffect(() => {
    // Simulate splash screen duration
    const splashTimer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 2000);

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install prompt after a delay if not already installed
      if (!isAppInstalled()) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    // Handle appinstalled event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      toast.success('Tasko installed successfully!');
    };

    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(splashTimer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  const closeInstallPrompt = () => {
    setShowInstallPrompt(false);
  };

  const isAppInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (navigator as any).standalone === true; // For iOS Safari
  };

  return {
    isOnline,
    showInstallPrompt: showInstallPrompt && !isAppInstalled(),
    installApp,
    closeInstallPrompt,
    showSplashScreen,
  };
}