import React from 'react';
import { toast } from 'sonner';

interface PWAContextType {
  isOnline: boolean;
  showInstallPrompt: boolean;
  installApp: () => Promise<void>;
  closeInstallPrompt: () => void;
  showSplashScreen: boolean;
}

const PWAContext = React.createContext<PWAContextType | undefined>(undefined);

export const PWAPROVIDER_SPLASH_SCREEN_DELAY = 2000; // 2 seconds

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = React.useState<Event | null>(null);
  const [showInstallPromptState, setShowInstallPromptState] = React.useState(false);
  const [showSplashScreen, setShowSplashScreen] = React.useState(true);

  // Function to check if the app is already installed
  const isAppInstalled = React.useCallback(() => {
    // Check if running in standalone mode (iOS) or if display-mode is standalone (Android/Desktop)
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }, []);

  React.useEffect(() => {
    // Hide splash screen after a delay
    const splashTimer = setTimeout(() => {
      setShowSplashScreen(false);
    }, PWAPROVIDER_SPLASH_SCREEN_DELAY);

    // Online/Offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You are back online!");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are currently offline.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Before install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt only if not already installed
      if (!isAppInstalled()) {
        setShowInstallPromptState(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // App installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPromptState(false);
      toast.success("Tasko installed successfully!");
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
            toast.error("Failed to register service worker for offline support.");
          });
      });
    }

    return () => {
      clearTimeout(splashTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isAppInstalled]); // Add isAppInstalled to dependencies

  const installApp = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPromptState(false);
      }
    }
  };

  const closeInstallPrompt = () => {
    setShowInstallPromptState(false);
  };

  const value = {
    isOnline,
    showInstallPrompt: showInstallPromptState,
    installApp,
    closeInstallPrompt,
    showSplashScreen,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};

export const usePWA = () => {
  const context = React.useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};