"use client";

import React, { useState } from "react";
import { AnswerDTO } from "./types";
import { ShieldCheck, CheckCircle2, ThumbsUp, ThumbsDown, User, MessageCircleReply, MessageSquare } from "lucide-react";
import Image from "next/image";

export function AnswerCard({ answer }: { answer: AnswerDTO }) {
  const [feedback, setFeedback] = useState<"helpful" | "not_helpful" | null>(null);

  const getAuthorBadge = () => {
    if (answer.author.role === "seller") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-background bg-foreground px-2 py-0.5 rounded">
          <ShieldCheck className="w-3 h-3" /> Seller
        </span>
      );
    }
    if (answer.author.role === "expert") {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-400/10 border border-indigo-400/20 px-2 py-0.5 rounded">
          <Award className="w-3 h-3" /> Expert
        </span>
      );
    }
    if (answer.author.isVerifiedBuyer) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3" /> Verified Buyer
        </span>
      );
    }
    return null;
  };

  return (
    <div className={`p-5 rounded-2xl border ${answer.isAccepted ? 'border-cta-primary bg-cta-primary/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-border bg-surface'} mb-4`}>
      
      {/* Official Answer Pinned Banner */}
      {answer.isAccepted && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-cta-primary mb-4 pb-3 border-b border-cta-primary/20">
          <CheckCircle2 className="w-4 h-4" />
          Official Accepted Answer
        </div>
      )}

      {/* Author Meta */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          answer.author.role === "seller" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
        }`}>
          {answer.author.role === "seller" ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{answer.author.name}</span>
            {getAuthorBadge()}
          </div>
          <span className="text-xs text-muted-foreground">{answer.createdAt}</span>
        </div>
      </div>

      {/* Answer Content */}
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap mb-4">
        {answer.content}
      </p>

      {/* Attached Media */}
      {answer.media && answer.media.length > 0 && (
        <div className="flex gap-3 mb-4">
          {answer.media.map((m, i) => (
            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity">
              <Image src={m.url} alt="Answer Media" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Feedback Mechanism */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
        <span className="text-xs font-medium text-muted-foreground mr-2">Did this answer the question?</span>
        
        <button 
          onClick={() => setFeedback("helpful")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            feedback === "helpful" 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" 
              : "bg-surface text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" /> Yes ({answer.helpfulVotes + (feedback === "helpful" ? 1 : 0)})
        </button>

        <button 
          onClick={() => setFeedback("not_helpful")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            feedback === "not_helpful" 
              ? "bg-danger/10 text-danger border-danger/30" 
              : "bg-surface text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" /> No ({answer.notHelpfulVotes + (feedback === "not_helpful" ? 1 : 0)})
        </button>
      </div>
    </div>
  );
}
// Temporary import for Award since it wasn't extracted at the top
import { Award } from "lucide-react";
