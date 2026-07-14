"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type PulseType = "purchase" | "vendor" | "flash-deal" | "review" | "stock" | "coupon";

export interface PulseEvent {
  id: string;
  type: PulseType;
  message: string;
  timestamp: number;
}

interface PulseContextType {
  events: PulseEvent[];
  addEvent: (type: PulseType, message: string) => void;
  removeEvent: (id: string) => void;
}

const PulseContext = createContext<PulseContextType>({
  events: [],
  addEvent: () => {},
  removeEvent: () => {}
});

export function usePulse() {
  return useContext(PulseContext);
}

export function PulseProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<PulseEvent[]>([]);

  const addEvent = (type: PulseType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setEvents(prev => [...prev, { id, type, message, timestamp: Date.now() }]);
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Simulated backend stream of events
  useEffect(() => {
    const messages = [
      { type: "purchase", message: "Someone in Nairobi bought AirPods Pro 2" },
      { type: "vendor", message: "James from Mombasa became a vendor" },
      { type: "flash-deal", message: "Flash Deal ends in 04:21" },
      { type: "stock", message: "Only 2 left: Vision Pro Max" },
      { type: "purchase", message: "Someone in London bought Aero Headphones" }
    ];

    let count = 0;
    const interval = setInterval(() => {
      if (count < messages.length) {
        const ev = messages[count];
        addEvent(ev.type as PulseType, ev.message);
        count++;
      }
    }, 8000); // Trigger a new event every 8s

    return () => clearInterval(interval);
  }, []);

  return (
    <PulseContext.Provider value={{ events, addEvent, removeEvent }}>
      {children}
    </PulseContext.Provider>
  );
}
