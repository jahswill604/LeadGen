import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-10 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong</h1>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            We've encountered an unexpected error. Our team has been notified and we're working to fix it.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95"
                            >
                                <RefreshCw className="w-4 h-4" /> Try Again
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="flex items-center justify-center gap-2 w-full py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
                            >
                                <Home className="w-4 h-4" /> Go to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
