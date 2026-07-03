"use client";

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { CheckCircle, Clock, MessageSquare, Send, User, Sparkles, AlertCircle } from "lucide-react";
import { useRealtime } from "@/domains/Realtime/hooks/useRealtime";
import { ChannelRegistry } from "@/domains/Realtime/contracts/ChannelRegistry";
import { RealtimeEvents } from "@/domains/Realtime/contracts/EventRegistry";
import { sendMessageAction } from "@/domains/Engagement/Conversation/actions";
import { generateSummaryAction, generateSuggestedRepliesAction } from "@/domains/Engagement/AI/actions";
import { usePresence } from "@/domains/Engagement/Presence/usePresence";
import { useUser } from "@clerk/nextjs";

type ConversationMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date | string;
};

type ConversationParticipant = {
  userId: string;
  role: string;
};

type Conversation = {
  id: string;
  title: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  participants: ConversationParticipant[];
  messages: ConversationMessage[];
};

export function SupportClient({ initialConversations }: { initialConversations: Conversation[] }) {
  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversations.map(c => ({
      ...c,
      messages: Array.isArray(c.messages) ? c.messages : []
    }))
  );
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversations[0]?.id || null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const { emitTyping, typingUsers, handleRemoteTyping } = usePresence(activeConversationId || "");

  const handleIncomingMessage = React.useCallback((data: any) => {
    setConversations(prev => {
      return prev.map(conv => {
        if (conv.id === data.conversationId) {
          // Check if we already have this message
          if (conv.messages.find(m => m.id === data.messageId)) return conv;
          return {
            ...conv,
            messages: [...conv.messages, {
              id: data.messageId,
              senderId: data.senderId,
              content: data.content,
              createdAt: data.timestamp
            }]
          };
        }
        return conv;
      });
    });
  }, []);

  // Realtime hook for incoming messages on the global admin feed
  useRealtime({
    channel: ChannelRegistry.adminLiveSupport(),
    event: RealtimeEvents.MESSAGE_SENT,
    onEvent: handleIncomingMessage
  });

  const handlePresenceUpdate = React.useCallback((data: any) => {
    // Update online status in UI if needed
  }, []);

  useRealtime({
    channel: ChannelRegistry.presenceSupport(),
    event: RealtimeEvents.PRESENCE_UPDATE,
    onEvent: handlePresenceUpdate
  });

  const handleUserTyping = React.useCallback((data: any) => {
    if (data.conversationId === activeConversationId) {
      handleRemoteTyping(data.userId, data.isTyping);
    }
  }, [activeConversationId, handleRemoteTyping]);

  useRealtime({
    channel: activeConversationId ? ChannelRegistry.presenceConversation(activeConversationId) : "",
    event: RealtimeEvents.USER_TYPING,
    onEvent: handleUserTyping
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeConversation?.messages]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeConversationId) return;

    setIsSubmitting(true);
    try {
      await sendMessageAction(activeConversationId, replyMessage);
      setReplyMessage("");
      // Realtime will add it, or we could optimistically add it here
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyMessage(e.target.value);
    emitTyping();
  };

  const handleGenerateSummary = async () => {
    if (!activeConversationId) return;
    setIsAiLoading(true);
    try {
      const summary = await generateSummaryAction(activeConversationId);
      setAiSummary(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSuggestReplies = async () => {
    if (!activeConversationId) return;
    setIsAiLoading(true);
    try {
      const replies = await generateSuggestedRepliesAction(activeConversationId);
      setSuggestedReplies(replies);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplySuggestion = (text: string) => {
    setReplyMessage(text);
  };

  const customerParticipant = activeConversation?.participants?.find(p => p.role === "CUSTOMER");
  const customerId = customerParticipant?.userId || "Unknown Customer";

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-160px)]">
      {/* Sidebar: Conversation List */}
      <div className="w-full lg:w-1/3 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden bg-white/5">
        <div className="p-4 border-b border-white/10 bg-black/40">
          <h2 className="text-white font-bold">Active Chats ({conversations.filter(c => c.status === "ACTIVE").length})</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
          {conversations.map(conv => {
            const lastMessage = conv.messages[conv.messages.length - 1];
            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setAiSummary(null);
                  setSuggestedReplies([]);
                }}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  activeConversationId === conv.id 
                    ? "bg-nova-blue/20 border-nova-blue/50" 
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    conv.status === "ACTIVE" ? "bg-red-400/20 text-red-400" :
                    "bg-nova-emerald/20 text-nova-emerald"
                  }`}>
                    {conv.status}
                  </span>
                  <span className="text-nova-silver text-xs">{format(new Date(conv.updatedAt), "MMM d, h:mm a")}</span>
                </div>
                <h3 className="text-white font-medium text-sm line-clamp-1 mb-1">{conv.title || "Support Request"}</h3>
                <p className="text-nova-silver text-xs truncate">
                  {lastMessage ? lastMessage.content : "No messages yet"}
                </p>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="p-8 text-center text-nova-silver">No conversations found.</div>
          )}
        </div>
      </div>

      {/* Main Content: Chat View */}
      <div className="w-full lg:w-2/3 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden bg-black/40 relative">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{activeConversation.title || "Support Request"}</h2>
                <div className="flex items-center gap-4 text-sm text-nova-silver">
                  <span className="flex items-center gap-1"><User className="w-4 h-4" /> {customerId}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {format(new Date(activeConversation.createdAt), "PPp")}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleGenerateSummary}
                  disabled={isAiLoading}
                  className="px-4 py-2 bg-nova-purple/20 text-nova-purple hover:bg-nova-purple hover:text-white transition-colors rounded-lg font-bold text-xs flex items-center gap-2 border border-nova-purple/30"
                >
                  <Sparkles className="w-4 h-4" /> Summary
                </button>
                <button 
                  onClick={handleSuggestReplies}
                  disabled={isAiLoading}
                  className="px-4 py-2 bg-nova-amber/20 text-nova-amber hover:bg-nova-amber hover:text-white transition-colors rounded-lg font-bold text-xs flex items-center gap-2 border border-nova-amber/30"
                >
                  <Sparkles className="w-4 h-4" /> Suggest Replies
                </button>
              </div>
            </div>

            {/* AI Summary Banner */}
            {aiSummary && (
              <div className="p-4 bg-nova-purple/10 border-b border-nova-purple/20 flex gap-3 items-start relative">
                <Sparkles className="w-5 h-5 text-nova-purple flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-nova-purple font-bold text-sm mb-1">Nova AI Summary</h4>
                  <p className="text-sm text-nova-silver">{aiSummary}</p>
                </div>
                <button onClick={() => setAiSummary(null)} className="absolute top-4 right-4 text-nova-silver hover:text-white">✕</button>
              </div>
            )}

            {/* Suggested Replies */}
            {suggestedReplies.length > 0 && (
              <div className="p-4 bg-nova-amber/10 border-b border-nova-amber/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-nova-amber font-bold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> AI Suggestions
                  </h4>
                  <button onClick={() => setSuggestedReplies([])} className="text-nova-silver hover:text-white text-xs">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleApplySuggestion(reply)}
                      className="px-3 py-1.5 bg-black/40 border border-nova-amber/30 text-nova-amber rounded-lg text-xs hover:bg-nova-amber hover:text-white transition-colors text-left line-clamp-1"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {activeConversation.messages.map((msg) => {
                const isSystem = msg.senderId === "SYSTEM";
                const isAi = msg.senderId === "NOVA_AI";
                const isAdmin = msg.senderId === user?.id; // Or a general admin check

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center">
                      <div className="px-4 py-1.5 bg-white/5 rounded-full text-xs font-medium text-nova-silver flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        {msg.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${
                      isAdmin 
                        ? "bg-nova-blue text-white rounded-tr-none" 
                        : isAi 
                          ? "bg-nova-purple text-white rounded-tl-none" 
                          : "glass-panel border border-white/10 bg-white/5 text-nova-silver rounded-tl-none"
                    }`}>
                      <div className="flex items-center gap-2 mb-2 opacity-70">
                        <span className="text-xs font-bold flex items-center gap-1">
                          {isAi && <Sparkles className="w-3 h-3" />}
                          {isAdmin ? "You" : isAi ? "Nova AI" : msg.senderId}
                        </span>
                        <span className="text-[10px]">• {format(new Date(msg.createdAt), "h:mm a")}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-2xl glass-panel border border-white/10 bg-white/5 text-nova-silver rounded-tl-none flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-nova-silver animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-nova-silver animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-nova-silver animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                    <span className="text-xs italic">Someone is typing...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            {activeConversation.status === "ACTIVE" ? (
              <div className="p-4 border-t border-white/10 bg-white/5">
                <form onSubmit={handleReply} className="flex gap-4">
                  <textarea
                    value={replyMessage}
                    onChange={handleTyping}
                    placeholder="Type your reply here..."
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
                <CheckCircle className="w-4 h-4 text-nova-emerald" /> This conversation is closed.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-nova-silver p-8 text-center">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a conversation from the sidebar to view details and reply.</p>
          </div>
        )}
      </div>
    </div>
  );
}
