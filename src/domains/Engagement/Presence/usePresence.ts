"use client";

import { useEffect, useState, useRef } from "react";
import { broadcastTypingAction } from "./actions";

export function usePresence(conversationId: string) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // We expose a method for the local user to call when they are typing
  const emitTyping = async () => {
    // Optimistically could do something, but mostly just dispatch
    try {
      await broadcastTypingAction(conversationId, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Auto-turn off typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(async () => {
        await broadcastTypingAction(conversationId, false);
      }, 3000);
      
    } catch (e) {
      console.error("Failed to broadcast typing status", e);
    }
  };

  // The actual listening for USER_TYPING from OTHERS will happen in the useRealtime hook 
  // where we pass it to setTypingUsers. We expose a helper to update it here.
  const handleRemoteTyping = (userId: string, isTyping: boolean) => {
    setTypingUsers(prev => {
      const next = new Set(prev);
      if (isTyping) next.add(userId);
      else next.delete(userId);
      return next;
    });
  };

  return {
    emitTyping,
    typingUsers: Array.from(typingUsers),
    handleRemoteTyping
  };
}
