import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Toast: React.FC = () => {
  const { toast } = useCart();

  if (!toast) return null;

  return (
    <div className="toast-banner">
      {toast.type === 'success' ? (
        <CheckCircle2 size={18} color="#A7D489" />
      ) : (
        <Info size={18} color="#C48B71" />
      )}
      <span>{toast.message}</span>
    </div>
  );
};
