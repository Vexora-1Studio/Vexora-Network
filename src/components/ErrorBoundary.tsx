import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('grid_user');
      localStorage.removeItem('vexora_active_tab');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          dir="rtl"
          className="min-h-screen w-full bg-[#030712] text-white flex items-center justify-center p-6 font-sans select-none"
        >
          <div className="max-w-md w-full bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-center relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-3xl">
              ⚡
            </div>

            <h1 className="text-xl font-bold tracking-wide mb-2 text-white">
              VEXORA NETWORK
            </h1>
            <p className="text-sm text-cyan-400/80 mb-6 font-mono">
              حدث خطأ أثناء تحميل الواجهة، تم حماية بياناتك
            </p>

            {this.state.error && (
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-mono text-red-400/90 mb-6 text-left overflow-auto max-h-32 dir-ltr">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                إعادة المحاولة / Reload
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors cursor-pointer"
              >
                إعادة ضبط الجلسة والبدء من جديد
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
