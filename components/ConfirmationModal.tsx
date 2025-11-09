import React from 'react';
import { CloseIcon } from './icons';

interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-emerald-600 hover:bg-emerald-700',
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 border border-white/10 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors"><CloseIcon className="w-5 h-5" /></button>
        </div>
        <div className="text-gray-300 text-sm mb-6">{message}</div>
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="w-full bg-gray-600 text-white rounded-lg py-2 hover:bg-gray-700 transition-colors active:scale-95 transform font-semibold">{cancelText}</button>
          <button onClick={onConfirm} className={`w-full text-white rounded-lg py-2 transition-colors active:scale-95 transform font-semibold ${confirmButtonClass}`}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
