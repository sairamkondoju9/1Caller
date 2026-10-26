import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const errorString = this.state.error ? this.state.error.toString() : '';
      const isDynamicChunkError =
        errorString.includes('dynamically imported module') ||
        errorString.includes('Failed to fetch dynamically imported module') ||
        errorString.includes('Loading chunk') ||
        errorString.includes('Load chunk failed');

      if (isDynamicChunkError) {
        return (
          <div className="min-h-[400px] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#181335] text-white p-6 sm:p-8 rounded-3xl border border-amber-400/30 shadow-2xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#7a50dc]/20 text-[#a78bfa] border border-[#a78bfa]/40 flex items-center justify-center mx-auto shadow-inner">
                <RotateCcw className="w-7 h-7 animate-spin" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight font-display text-white">
                  App Update Available
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  A fresh update has been deployed. Click below to load the latest high-speed version with zero data loss.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] text-[#130e26] font-bold text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:opacity-90 active:scale-98 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Load Latest Version Now
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#181335] text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight font-display text-white">
                Something went wrong
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                A rendering issue occurred, but your data is safe. Click below to refresh this section.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-left text-xs font-mono text-red-300 max-h-32 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D99A2B] to-[#F2B94A] text-[#130e26] font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reload View
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-medium text-xs flex items-center gap-1.5 hover:bg-white/15 cursor-pointer transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                Refresh Page
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
