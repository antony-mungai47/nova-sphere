"use client";

import React, { useState } from "react";
import { updateNotificationPreference } from "@/domains/Engagement/Notifications/actions";
import { NotificationType } from "@prisma/client";

const notificationTypes = [
  { type: NotificationType.ORDER_UPDATED, label: "Order Updates", desc: "When your order is confirmed, shipped, or delivered." },
  { type: NotificationType.BID_OUTBID, label: "Auction Outbid", desc: "When someone places a higher bid than you." },
  { type: NotificationType.AUCTION_WON, label: "Auction Won", desc: "When you win an auction." },
  { type: NotificationType.PRICE_DROP, label: "Price Drops", desc: "When an item on your wishlist goes on sale." },
  { type: NotificationType.SUPPORT_REPLY, label: "Support Replies", desc: "When our team replies to your ticket." },
  { type: NotificationType.SYSTEM_ALERT, label: "System Alerts", desc: "Important updates about your account or the platform." },
];

export function NotificationsClient({ initialPreferences, userId }: { initialPreferences: any[], userId: string }) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [loading, setLoading] = useState<string | null>(null);

  const getPref = (type: string) => {
    return preferences.find(p => p.type === type) || { inApp: true, email: true };
  };

  const handleToggle = async (type: NotificationType, channel: 'inApp' | 'email', currentValue: boolean) => {
    setLoading(type + channel);
    try {
      const { prefs } = await updateNotificationPreference(userId, type, { [channel]: !currentValue });
      if (prefs) {
        setPreferences(prev => {
          const exists = prev.find(p => p.type === type);
          if (exists) {
            return prev.map(p => p.type === type ? prefs : p);
          }
          return [...prev, prefs];
        });
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 border-b border-white/10">
              <th className="p-4 text-sm font-semibold text-slate-300">Notification Type</th>
              <th className="p-4 text-sm font-semibold text-slate-300 text-center w-32">In-App Toast</th>
              <th className="p-4 text-sm font-semibold text-slate-300 text-center w-32">Email</th>
            </tr>
          </thead>
          <tbody>
            {notificationTypes.map(({ type, label, desc }) => {
              const pref = getPref(type);
              return (
                <tr key={type} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-white">{label}</p>
                    <p className="text-xs text-slate-400 mt-1">{desc}</p>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      disabled={loading === type + 'inApp'}
                      onClick={() => handleToggle(type, 'inApp', pref.inApp)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pref.inApp ? 'bg-primary-500' : 'bg-slate-700'} ${loading === type + 'inApp' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pref.inApp ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      disabled={loading === type + 'email'}
                      onClick={() => handleToggle(type, 'email', pref.email)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pref.email ? 'bg-primary-500' : 'bg-slate-700'} ${loading === type + 'email' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pref.email ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
