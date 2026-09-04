import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[EduNova ErrorBoundary caught runtime exception]:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#040810] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-[#0b1329] border-2 border-red-500/40 rounded-2xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.25)]">
            <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto mb-5 text-3xl">
              🧪
            </div>
            <h2 className="text-xl font-orbitron font-extrabold text-red-500 mb-2 tracking-wider">
              EduNova System Recovery
            </h2>
            <p className="text-xs text-slate-300 font-space mb-6 leading-relaxed">
              EduNova could not load this screen due to a transient runtime execution issue.
            </p>
            {this.state.error?.message && (
              <div className="bg-slate-950 border border-red-500/30 rounded-xl p-3 mb-6 text-[11px] font-mono text-red-300 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleRetry}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-orbitron font-extrabold text-xs tracking-widest uppercase hover:brightness-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Retry & Reload Screen
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
