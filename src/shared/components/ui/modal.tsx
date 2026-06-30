"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MOTION } from "@/lib/motion";
import { Button } from "./button";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  preventOutsideClose?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  footer,
  className,
  preventOutsideClose = false
}: ModalProps) {
  
  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventOutsideClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            aria-hidden="true"
          />
          
          <motion.div
            variants={MOTION.modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby={description ? "modal-description" : undefined}
            className={cn(
              "relative z-10 w-full max-w-lg flex flex-col gap-4 overflow-hidden rounded-[var(--radius-xl)] bg-surface-elevated border border-border-default shadow-xl",
              className
            )}
          >
            <div className="flex items-start justify-between p-[var(--space-6)] pb-0">
              <div className="flex flex-col gap-1">
                {title && (
                  <h2 id="modal-title" className="text-[var(--text-h3)] font-semibold text-primary">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="modal-description" className="text-[var(--text-small)] text-muted">
                    {description}
                  </p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="w-8 h-8 rounded-full ml-auto shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-[var(--space-6)] pt-2 overflow-y-auto max-h-[60vh]">
              {children}
            </div>
            
            {footer && (
              <div className="flex items-center justify-end gap-3 p-[var(--space-6)] pt-0 border-t border-border-subtle/50 bg-surface/50">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
