import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import PremiumAlert, { AlertButton, PremiumAlertProps } from '../components/ui/PremiumAlert';
import { Ionicons } from '@expo/vector-icons';

type ShowAlertParams = {
  title: string;
  message?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  variant?: 'centered' | 'horizontal';
  buttons?: AlertButton[];
};

interface AlertContextType {
  showAlert: (params: ShowAlertParams) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertConfig, setAlertConfig] = useState<PremiumAlertProps | null>(null);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => prev ? { ...prev, visible: false } : null);
    // We keep the state around briefly to allow the fade-out animation to play
    setTimeout(() => {
      setAlertConfig(null);
    }, 200); // Slightly longer than the 150ms exit animation
  }, []);

  const showAlert = useCallback((params: ShowAlertParams) => {
    setAlertConfig({
      ...params,
      visible: true,
      onDismiss: hideAlert,
    });
  }, [hideAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertConfig && (
        <PremiumAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          iconName={alertConfig.iconName}
          variant={alertConfig.variant}
          buttons={alertConfig.buttons}
          onDismiss={alertConfig.onDismiss}
        />
      )}
    </AlertContext.Provider>
  );
}

export function usePremiumAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('usePremiumAlert must be used within an AlertProvider');
  }
  return context;
}
