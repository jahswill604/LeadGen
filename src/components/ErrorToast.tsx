import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message: string;
    duration?: number;
}

interface ErrorToastProps {
    toast: Toast | null;
    onDismiss: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ toast, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (toast) {
            setIsVisible(true);
            const duration = toast.duration || 5000;

            if (duration > 0) {
                const timer = setTimeout(() => {
                    handleDismiss();
                }, duration);

                return () => clearTimeout(timer);
            }
        } else {
            setIsVisible(false);
        }
    }, [toast]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => {
            onDismiss();
        }, 300);
    };

    if (!toast) return null;

    const config = {
        error: {
            icon: AlertCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-500',
            titleColor: 'text-red-900',
            messageColor: 'text-red-700',
            progressColor: 'bg-red-500'
        },
        success: {
            icon: CheckCircle2,
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            iconColor: 'text-emerald-500',
            titleColor: 'text-emerald-900',
            messageColor: 'text-emerald-700',
            progressColor: 'bg-emerald-500'
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            iconColor: 'text-amber-500',
            titleColor: 'text-amber-900',
            messageColor: 'text-amber-700',
            progressColor: 'bg-amber-500'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-500',
            titleColor: 'text-blue-900',
            messageColor: 'text-blue-700',
            progressColor: 'bg-blue-500'
        }
    };

    const { icon: Icon, bgColor, borderColor, iconColor, titleColor, messageColor, progressColor } = config[toast.type];

    return (
        <div className="fixed top-4 right-4 z-[100] max-w-sm w-full px-4 sm:px-0">
            <div
                className={`
          ${bgColor} ${borderColor} border-2 rounded-xl shadow-2xl p-4 
          transform transition-all duration-300 ease-out
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
            >
                <div className="flex items-start gap-3">
                    <div className={`${iconColor} flex-shrink-0 mt-0.5`}>
                        <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className={`${titleColor} font-bold text-sm mb-1`}>{toast.title}</h4>
                        <p className={`${messageColor} text-xs leading-relaxed break-words`}>{toast.message}</p>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {toast.duration && toast.duration > 0 && (
                    <div className="mt-3 h-1 bg-white/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${progressColor} rounded-full animate-[shrink_${toast.duration}ms_linear]`}
                            style={{
                                animation: `shrink ${toast.duration}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>

            <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
};

// Toast Manager Hook
export const useToast = () => {
    const [toast, setToast] = useState<Toast | null>(null);

    const showToast = (type: ToastType, title: string, message: string, duration = 5000) => {
        setToast({
            id: Math.random().toString(36).substr(2, 9),
            type,
            title,
            message,
            duration
        });
    };

    const dismissToast = () => {
        setToast(null);
    };

    return {
        toast,
        showToast,
        dismissToast,
        showError: (title: string, message: string, duration?: number) =>
            showToast('error', title, message, duration),
        showSuccess: (title: string, message: string, duration?: number) =>
            showToast('success', title, message, duration),
        showWarning: (title: string, message: string, duration?: number) =>
            showToast('warning', title, message, duration),
        showInfo: (title: string, message: string, duration?: number) =>
            showToast('info', title, message, duration),
    };
};
