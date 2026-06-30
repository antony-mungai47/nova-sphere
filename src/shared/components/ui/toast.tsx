"use client";

import * as React from "react";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    
    // Auto remove
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, toast.duration || 5000);
    }
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Helper to easily trigger toasts from anywhere
export const toast = {
  default: (title: string, description?: string) => useToastStore.getState().addToast({ title, description, variant: "default" }),
  success: (title: string, description?: string) => useToastStore.getState().addToast({ title, description, variant: "success" }),
  error: (title: string, description?: string) => useToastStore.getState().addToast({ title, description, variant: "error" }),
  warning: (title: string, description?: string) => useToastStore.getState().addToast({ title, description, variant: "warning" }),
  info: (title: string, description?: string) => useToastStore.getState().addToast({ title, description, variant: "info" }),
};

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  const icons = {
    default: null,
    success: <CheckCircle2 className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-info" />,
  };

  const borderColors = {
    default: "border-border-default",
    success: "border-success/20",
    error: "border-danger/20",
    warning: "border-warning/20",
    info: "border-info/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      layout
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-[var(--radius-lg)] border bg-surface-elevated p-6 pr-8 shadow-lg transition-all",
        borderColors[toast.variant || "default"]
      )}
    >
      <div className="flex items-start gap-4 w-full">
        {toast.variant && toast.variant !== "default" && (
          <div className="flex-shrink-0 mt-0.5">{icons[toast.variant]}</div>
        )}
        <div className="flex flex-col gap-1 w-full">
          <h3 className="text-[var(--text-small)] font-semibold text-primary">{toast.title}</h3>
          {toast.description && (
            <p className="text-[var(--text-caption)] text-muted">{toast.description}</p>
          )}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-muted opacity-50 transition-opacity hover:opacity-100 focus:opacity-100 focus-ring"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
