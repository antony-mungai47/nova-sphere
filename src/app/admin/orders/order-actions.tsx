"use client";

import React, { useState } from "react";
import { updateOrderStatus, processRefund } from "./actions";
import { MoreVertical, Loader2, CheckCircle2, Package, RefreshCw } from "lucide-react";

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
}

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleStatusUpdate(newStatus: string) {
    setIsPending(true);
    setIsOpen(false);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (e) {
      alert("Failed to update status");
    } finally {
      setIsPending(false);
    }
  }

  async function handleRefund() {
    if (!confirm("Are you sure you want to refund this order? This action cannot be undone.")) return;
    setIsPending(true);
    setIsOpen(false);
    try {
      await processRefund(orderId);
    } catch (e) {
      alert("Failed to process refund");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="p-2 text-nova-silver hover:text-white rounded-lg hover:bg-white/10 transition-colors"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1A1A2E] border border-white/10 shadow-2xl z-20 overflow-hidden py-1">
            <div className="px-3 py-2 border-b border-white/10 text-xs text-nova-silver font-medium uppercase tracking-wider">
              Update Status
            </div>
            {['PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={status === currentStatus}
                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 disabled:opacity-50 disabled:hover:bg-transparent flex items-center justify-between"
              >
                {status}
                {status === currentStatus && <CheckCircle2 className="w-4 h-4 text-nova-emerald" />}
              </button>
            ))}
            
            <div className="border-t border-white/10 mt-1 pt-1">
              <button
                onClick={handleRefund}
                disabled={currentStatus === 'REFUNDED' || currentStatus === 'CANCELLED'}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 disabled:opacity-50 disabled:hover:bg-transparent flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Process Refund
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
