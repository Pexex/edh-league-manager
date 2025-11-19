import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-[150]" onClick={onCancel}>
      <div className="bg-slate-800 rounded-2xl w-full max-w-sm p-6 border border-slate-600 shadow-2xl animate-bounce-in" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-300 mb-8 text-sm leading-relaxed">
          {message}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onCancel} 
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-900/20 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;