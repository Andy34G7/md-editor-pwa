import React, { useEffect, useRef } from 'react';
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
    // Use a ref to store the latest onClose callback.
    // This allows us to call the latest version of the callback without including it
    // in the useEffect dependency array, preventing unnecessary timer resets
    // if the parent component recreates the callback on every render.
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onCloseRef.current();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const getIcon = () => {
        switch (type) {
            case 'error': return <AlertCircle size={20} color="#e74c3c" />;
            case 'success': return <CheckCircle size={20} color="#2ecc71" />;
            case 'info': return <Info size={20} color="#3498db" />;
        }
    };

    return (
        <div
            className={`toast ${type}`}
            role={type === 'error' ? 'alert' : 'status'}
            aria-live={type === 'error' ? 'assertive' : 'polite'}
        >
            {getIcon()}
            <span className="toast-message">{message}</span>
            <button
                className="toast-close"
                type="button"
                onClick={onClose}
                aria-label="Dismiss notification"
            >
                <X size={16} />
            </button>
        </div>
    );
};
