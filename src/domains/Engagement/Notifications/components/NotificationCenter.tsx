"use client";

import React, { useState } from "react";
import { Bell, Check, Settings, Trash2 } from "lucide-react";
import { useNotifications } from "@/domains/Realtime/hooks/useNotifications";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationCenter({ userId, enabled }: { userId: string | null; enabled: boolean }) {
  if (!enabled || !userId) return null;

  const { items, unreadCount, markAsRead } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 max-h-96 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col z-50"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-semibold text-white">Notifications</h3>
              <div className="flex gap-2">
                <Link href="/account/notifications" className="text-slate-400 hover:text-white transition-colors" title="Settings">
                  <Settings className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {items.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No notifications yet.
                </div>
              ) : (
                <div className="flex flex-col">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`p-4 border-b border-white/5 flex gap-3 transition-colors ${item.isRead ? 'opacity-60 bg-transparent' : 'bg-primary-900/10'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm truncate ${item.isRead ? 'text-slate-300' : 'text-white font-medium'}`}>
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-500 shrink-0 ml-2 mt-1">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {item.message}
                        </p>
                        {item.link && (
                          <Link href={item.link} className="inline-block mt-2 text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors">
                            View
                          </Link>
                        )}
                      </div>
                      {!item.isRead && (
                        <button 
                          onClick={() => markAsRead(item.id)}
                          className="shrink-0 p-1 h-fit text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 rounded"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
