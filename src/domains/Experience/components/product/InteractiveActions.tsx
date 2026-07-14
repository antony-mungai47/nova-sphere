"use client";

import React from "react";
import { Heart, ArrowLeftRight, Share2, BellRing, MessageSquare, Flag, Link as LinkIcon } from "lucide-react";

export function InteractiveActions() {
  const actions = [
    { icon: <Heart className="w-4 h-4" />, label: "Wishlist", onClick: () => {} },
    { icon: <ArrowLeftRight className="w-4 h-4" />, label: "Compare", onClick: () => {} },
    { icon: <BellRing className="w-4 h-4" />, label: "Price Alert", onClick: () => {} },
    { icon: <Share2 className="w-4 h-4" />, label: "Share", onClick: () => {} },
    { icon: <MessageSquare className="w-4 h-4" />, label: "Ask Seller", onClick: () => {} },
    { icon: <LinkIcon className="w-4 h-4" />, label: "Copy Link", onClick: () => {} },
    { icon: <Flag className="w-4 h-4 text-danger/70" />, label: "Report", onClick: () => {}, danger: true },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 py-4 border-b border-border my-4">
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={action.onClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            action.danger 
              ? "text-danger/80 hover:bg-danger/10" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}
