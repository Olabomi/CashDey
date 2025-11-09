import React, { createContext, useState, useContext, useMemo } from 'react';
import type { ActiveView } from '../types';

export interface NavigationContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  const value = useMemo(() => ({ activeView, setActiveView }), [activeView]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
