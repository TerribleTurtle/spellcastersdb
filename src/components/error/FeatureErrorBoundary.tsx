"use client";

import { Component, ErrorInfo, ReactNode } from "react";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { monitoring } from "@/services/monitoring";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class FeatureErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    monitoring.captureException(error, {
      operation: "FeatureErrorBoundary",
      componentStack: errorInfo?.componentStack,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-surface-card border border-status-danger-border rounded-xl space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-status-danger-border text-status-danger flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-text-primary">
              Something went wrong
            </h3>
            <p className="text-sm text-text-muted">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-surface-hover hover:bg-surface-hover text-text-primary rounded-lg transition-colors font-bold text-sm"
          >
            <RefreshCw size={14} />
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
