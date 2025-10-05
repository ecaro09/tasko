"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
          <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
                <AlertTriangle size={28} /> Something went wrong!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                We're sorry, but an unexpected error occurred.
              </p>
              {this.state.error && (
                <details className="text-sm text-gray-500 dark:text-gray-400 text-left p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <summary className="cursor-pointer font-semibold">Error Details</summary>
                  <pre className="whitespace-pre-wrap break-words mt-2">
                    {this.state.error.toString()}
                    <br />
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white mr-2">
                Reload Page
              </Button>
              <Link to="/">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white flex items-center gap-2">
                  <Home size={18} /> Go to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;