"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, NotificationItem } from "@/domains/Realtime/hooks/useNotifications";
import Link from "next/link";
import { X, Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";

export function RealtimeToaster({ userId, enabled }: { userId: string | null; enabled: boolean }) {
  if (!enabled || !userId) return null;

  const { items, markAsRead } = useNotifications(userId);
  const [activeToasts, setActiveToasts] = useState<NotificationItem[]>([]);

  // When a new unread item arrives, add it to the active toasts queue
  useEffect(() => {
    const unreadUnshown = items.filter(item => !item.isRead && !activeToasts.find(t => t.id === item.id));
    if (unreadUnshown.length > 0) {
      // Add only the 3 most recent to avoid overwhelming
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveToasts(prev => [...unreadUnshown.slice(0, 3), ...prev].slice(0, 3));
    }
  }, [items, activeToasts]);

  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
    markAsRead(id); // Optimistically mark as read locally
  };

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (activeToasts.length === 0) return;
    
    const timers = activeToasts.map(toast => {
      return setTimeout(() => {
        dismissToast(toast.id);
      }, 5000); // 5 seconds duration
    });

    return () => timers.forEach(clearTimeout);
  }, [activeToasts]);

  const getIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <AlertTriangle className="text-red-500 w-5 h-5" />;
      case 'HIGH': return <Bell className="text-orange-500 w-5 h-5" />;
      case 'LOW': return <Info className="text-blue-500 w-5 h-5" />;
      default: return <CheckCircle className="text-green-500 w-5 h-5" />;
    }
  };

  const getBorderColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'border-red-500/50';
      case 'HIGH': return 'border-orange-500/50';
      case 'LOW': return 'border-blue-500/50';
      default: return 'border-green-500/50';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      <AnimatePresence>
        {activeToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`bg-slate-900/90 backdrop-blur-md border ${getBorderColor(toast.priority)} rounded-xl p-4 shadow-2xl relative overflow-hidden`}
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            <div className="flex gap-3 relative z-10">
              <div className="shrink-0 mt-1">
                {getIcon(toast.priority)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-100 truncate">{toast.title}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {toast.message}
                </p>
                {toast.link && (
                  <Link 
                    href={toast.link} 
                    className="inline-block mt-2 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
                    onClick={() => dismissToast(toast.id)}
                  >
                    View Details &rarr;
                  </Link>
                )}
              </div>
              <button 
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 p-1 text-slate-500 hover:text-slate-300 transition-colors h-fit rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
