"use client";

import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { MessageSquare, X, Send, Paperclip, Sparkles, AlertCircle } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { getActiveCustomerConversationAction, createCustomerConversationAction, sendCustomerMessageAction } from "@/domains/Customer/support/actions";
import { useRealtime } from "@/domains/Realtime/hooks/useRealtime";
import { ChannelRegistry } from "@/domains/Realtime/contracts/ChannelRegistry";
import { RealtimeEvents } from "@/domains/Realtime/contracts/EventRegistry";
import { usePresence } from "@/domains/Engagement/Presence/usePresence";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date | string;
};

export function LiveSupportWidget() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { emitTyping, typingUsers, handleRemoteTyping } = usePresence(conversationId || "");

  const handleIncomingMessage = React.useCallback((data: any) => {
    setMessages(prev => {
      if (prev.find(m => m.id === data.messageId)) return prev;
      return [...prev, {
        id: data.messageId,
        senderId: data.senderId,
        content: data.content,
        createdAt: data.timestamp
      }];
    });
    
    setIsOpen(currentIsOpen => {
      if (!currentIsOpen) {
        setUnreadCount(count => count + 1);
      }
      return currentIsOpen;
    });
  }, []);

  useRealtime({
    channel: conversationId ? ChannelRegistry.privateConversation(conversationId) : "",
    event: RealtimeEvents.MESSAGE_SENT,
    onEvent: handleIncomingMessage
  });

  const handleUserTyping = React.useCallback((data: any) => {
    if (data.userId !== user?.id) {
      handleRemoteTyping(data.userId, data.isTyping);
    }
  }, [user?.id, handleRemoteTyping]);

  useRealtime({
    channel: conversationId ? ChannelRegistry.presenceConversation(conversationId) : "",
    event: RealtimeEvents.USER_TYPING,
    onEvent: handleUserTyping
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUsers]);

  const loadConversation = async () => {
    setIsLoading(true);
    try {
      const conv = await getActiveCustomerConversationAction();
      if (conv) {
        setConversationId(conv.id);
        setMessages(conv.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const text = inputValue.trim();
    setInputValue("");
    
    // Optistic UI could go here, but we'll wait for server for simplicity and exact ID

    try {
      if (!conversationId) {
        setIsLoading(true);
        const conv = await createCustomerConversationAction(text);
        if (conv) {
          setConversationId(conv.id);
          setMessages(conv.messages); // Will include the first message
        }
        setIsLoading(false);
      } else {
        await sendCustomerMessageAction(conversationId, text);
      }
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (conversationId) {
      emitTyping();
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (isSignedIn && isLoaded && !conversationId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadConversation();
      }
    }
  }, [isOpen, isSignedIn, isLoaded]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col mb-4 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-nova-blue/20 to-nova-amber/20 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold flex items-center gap-2">
                Nova Support <Sparkles className="w-4 h-4 text-nova-amber" />
              </h3>
              <p className="text-xs text-nova-silver">We typically reply in minutes</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-nova-silver hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin flex flex-col bg-white/5">
            {isLoading && messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-nova-silver">
                <div className="w-5 h-5 border-2 border-nova-blue border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {!isLoading && messages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 opacity-70">
                <div className="w-12 h-12 rounded-full bg-nova-blue/20 flex items-center justify-center text-nova-blue">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm text-nova-silver max-w-[200px]">Send a message to start a conversation with our support team.</p>
              </div>
            )}

            {messages.map(msg => {
              const isMe = msg.senderId === user.id;
              const isAi = msg.senderId === "NOVA_AI";
              const isSystem = msg.senderId === "SYSTEM";

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] text-nova-silver">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${
                    isMe 
                      ? "bg-nova-blue text-white rounded-tr-none" 
                      : isAi
                        ? "bg-nova-amber/80 text-white rounded-tl-none border border-nova-amber"
                        : "bg-white/10 text-white rounded-tl-none border border-white/5"
                  }`}>
                    {!isMe && (
                      <div className="flex items-center gap-1 mb-1 opacity-70">
                        {isAi && <Sparkles className="w-3 h-3" />}
                        <span className="text-[10px] font-bold">{isAi ? "Nova AI" : "Support"}</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div className={`text-[9px] mt-1 text-right ${isMe ? "text-blue-200" : "text-nova-silver"}`}>
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </div>
                  </div>
                </div>
              );
            })}

            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-2xl bg-white/10 rounded-tl-none border border-white/5 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-nova-silver animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1 h-1 rounded-full bg-nova-silver animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1 h-1 rounded-full bg-nova-silver animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-black/40 border-t border-white/10">
            <form onSubmit={handleSend} className="flex items-end gap-2">
              <button 
                type="button" 
                className="p-2 text-nova-silver hover:text-white hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
                title="Attach a file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 bg-white/5 border border-white/10 rounded-xl flex items-center pr-1 focus-within:border-nova-blue/50 transition-colors">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white focus:outline-none placeholder:text-nova-silver/50"
                  disabled={isLoading && !conversationId}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || (isLoading && !conversationId)}
                  className="p-1.5 m-1 bg-nova-blue text-white rounded-lg hover:bg-nova-blue/80 transition-colors disabled:opacity-50 disabled:hover:bg-nova-blue flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => {
          if (!isOpen) setUnreadCount(0);
          setIsOpen(!isOpen);
        }}
        className="w-14 h-14 bg-gradient-to-tr from-nova-blue to-nova-amber rounded-full shadow-lg shadow-nova-blue/20 flex items-center justify-center text-white hover:scale-105 transition-transform relative"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
