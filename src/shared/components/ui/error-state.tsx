import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "An unexpected error occurred while loading this content.", 
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-[var(--space-8)] border border-danger/20 bg-danger/5 rounded-[var(--radius-lg)] text-center w-full min-h-[200px] ${className || ""}`}>
      <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-[var(--text-h4)] font-semibold text-primary mb-2">{title}</h3>
      <p className="text-[var(--text-body)] text-muted max-w-sm mx-auto mb-6">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}
