"use client";

import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useChat } from '@ai-sdk/react';

export function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { messages, sendMessage } = useChat({
    id: 'support-chat-1',
    messages: [
      {
        id: 'initial',
        role: 'assistant',
        content: 'Hi! I am Nova AI. How can I help you today? I can track orders, answer questions, or connect you to a human agent.',
        parts: [{ type: 'text', text: 'Hi! I am Nova AI. How can I help you today? I can track orders, answer questions, or connect you to a human agent.' }]
      } as any
    ]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    await sendMessage({ role: 'user', content: input, parts: [{ type: 'text', text: input }] } as any);
    setInput("");
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border border-white/10 ${isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90' : 'bg-nova-blue hover:bg-blue-600'}`}
      >
        {isOpen ? <X className="text-white w-6 h-6" /> : <MessageCircle className="text-white w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-nova-blue/10 border-b border-white/5 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-nova-blue/20 flex items-center justify-center">
              <Bot className="text-nova-blue w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Nova Support Platform</h3>
              <p className="text-emerald-400 text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AI Agent Active
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 h-96 overflow-y-auto flex flex-col gap-4">
            {messages.map((m: any) => (
              <div key={m.id} className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-white/10' : 'bg-nova-blue/20'}`}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-nova-blue" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-nova-blue text-white rounded-tr-sm' : 'bg-white/5 text-nova-silver border border-white/5 rounded-tl-sm'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-nova-blue/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-nova-blue" />
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm text-nova-silver flex items-center gap-1">
                  <span className="w-2 h-2 bg-nova-silver rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-nova-silver rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-nova-silver rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-[#121212]">
            <div className="relative flex items-center">
              <input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-4 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-nova-blue transition-colors"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-nova-blue rounded-full text-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-nova-blue transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-white/30">Nova AI • Escalates to human if needed</span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
