"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { CheckCircle, Clock, MessageSquare, Send, User } from "lucide-react";
import { replyToTicket, resolveTicket } from "@/domains/Customer/account/support-actions";

type TicketMessage = {
  id: string;
  sender: string;
  content: string;
  createdAt: Date;
};

type Ticket = {
  id: string;
  email: string;
  subject: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  messages: TicketMessage[];
};

export function SupportClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [activeTicketId, setActiveTicketId] = useState<string | null>(initialTickets[0]?.id || null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTicket = initialTickets.find(t => t.id === activeTicketId);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicketId) return;

    setIsSubmitting(true);
    try {
      await replyToTicket(activeTicketId, replyMessage);
      setReplyMessage("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!activeTicketId) return;
    try {
      await resolveTicket(activeTicketId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-160px)]">
      {/* Sidebar: Ticket List */}
      <div className="w-full lg:w-1/3 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden bg-white/5">
        <div className="p-4 border-b border-white/10 bg-black/40">
          <h2 className="text-white font-bold">Open Tickets ({initialTickets.filter(t => t.status !== "RESOLVED").length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
          {initialTickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => setActiveTicketId(ticket.id)}
              className={`w-full text-left p-4 rounded-xl transition-all border ${
                activeTicketId === ticket.id 
                  ? "bg-nova-blue/20 border-nova-blue/50" 
                  : "bg-transparent border-transparent hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  ticket.status === "OPEN" ? "bg-red-400/20 text-red-400" :
                  ticket.status === "IN_PROGRESS" ? "bg-nova-amber/20 text-nova-amber" :
                  "bg-nova-emerald/20 text-nova-emerald"
                }`}>
                  {ticket.status.replace("_", " ")}
                </span>
                <span className="text-nova-silver text-xs">{format(new Date(ticket.createdAt), "MMM d, h:mm a")}</span>
              </div>
              <h3 className="text-white font-medium text-sm line-clamp-1 mb-1">{ticket.subject}</h3>
              <p className="text-nova-silver text-xs truncate">{ticket.email}</p>
            </button>
          ))}
          {initialTickets.length === 0 && (
            <div className="p-8 text-center text-nova-silver">No tickets found.</div>
          )}
        </div>
      </div>

      {/* Main Content: Chat View */}
      <div className="w-full lg:w-2/3 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden bg-black/40">
        {activeTicket ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{activeTicket.subject}</h2>
                <div className="flex items-center gap-4 text-sm text-nova-silver">
                  <span className="flex items-center gap-1"><User className="w-4 h-4" /> {activeTicket.email}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {format(new Date(activeTicket.createdAt), "PPp")}</span>
                </div>
              </div>
              {activeTicket.status !== "RESOLVED" && (
                <button 
                  onClick={handleResolve}
                  className="px-4 py-2 bg-nova-emerald/20 text-nova-emerald hover:bg-nova-emerald hover:text-white transition-colors rounded-lg font-bold text-sm flex items-center gap-2 border border-nova-emerald/30"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Resolved
                </button>
              )}
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {activeTicket.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "ADMIN" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.sender === "ADMIN" 
                      ? "bg-nova-blue text-white rounded-tr-none" 
                      : "glass-panel border border-white/10 bg-white/5 text-nova-silver rounded-tl-none"
                  }`}>
                    <div className="flex items-center gap-2 mb-2 opacity-70">
                      <span className="text-xs font-bold">{msg.sender}</span>
                      <span className="text-[10px]">• {format(new Date(msg.createdAt), "h:mm a")}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            {activeTicket.status !== "RESOLVED" ? (
              <div className="p-4 border-t border-white/10 bg-white/5">
                <form onSubmit={handleReply} className="flex gap-4">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here... (will be emailed to customer)"
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-nova-blue resize-none h-14"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !replyMessage.trim()}
                    className="px-6 py-2 bg-nova-blue text-white rounded-xl font-bold hover:bg-nova-blue/80 transition-colors disabled:opacity-50 flex items-center gap-2 h-14"
                  >
                    <Send className="w-4 h-4" /> {isSubmitting ? "Sending..." : "Reply"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-4 border-t border-white/10 bg-white/5 text-center text-nova-silver flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-nova-emerald" /> This ticket is resolved.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-nova-silver p-8 text-center">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a ticket from the sidebar to view details and reply.</p>
          </div>
        )}
      </div>
    </div>
  );
}
