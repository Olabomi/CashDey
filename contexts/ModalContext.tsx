import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';
import type { ModalState, ModalType } from '../types';

interface ModalContextType {
  modalState: ModalState;
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({ type: null, props: {} });

  const openModal = (type: ModalType, props: any = {}) => {
    setModalState({ type, props });
  };

  const closeModal = () => {
    setModalState({ type: null, props: {} });
  };
  
  const value = useMemo(() => ({ modalState, openModal, closeModal }), [modalState]);

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
