import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import './Toast.css';

export type ToastType = 'error' | 'success' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 5000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'error': return <AlertCircle size={20} color="#e74c3c" />;
            case 'success': return <CheckCircle size={20} color="#2ecc71" />;
            case 'info': return <Info size={20} color="#3498db" />;
        }
    };

    return (
        <div className={`toast ${type}`}>
            {getIcon()}
            <span className="toast-message">{message}</span>
            <button className="toast-close" onClick={onClose}>
                <X size={16} />
            </button>
        </div>
    );
};
