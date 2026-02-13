"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DragDropErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("DragDrop Error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Ideally we might want to reset the drag state here too, 
    // but a re-render of children often fixes transient dnd state issues.
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-surface-main">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
            <AlertTriangle className="text-red-500" size={32} />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">
            Interaction Error
          </h2>
          <p className="text-gray-400 max-w-md mb-6 text-sm">
            Something went wrong with the drag and drop interface. This is usually temporary.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-brand-primary/80 transition-colors"
          >
            <RefreshCw size={16} />
            Reset Interface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
