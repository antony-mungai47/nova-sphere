"use client";

import { Search, Mic, Camera } from "lucide-react";
import { useDiscoveryUI } from "../sdk/hooks";

interface OmnibarProps {
  className?: string;
  placeholder?: string;
}

export function Omnibar({ className = "", placeholder = "Search products, brands..." }: OmnibarProps) {
  const { open } = useDiscoveryUI();

  return (
    <div 
      className={`group relative flex items-center h-12 bg-surface hover:bg-surface-hover border border-border hover:border-muted-foreground/30 rounded-full px-4 transition-all cursor-text overflow-hidden ${className}`}
      onClick={open}
    >
      <Search className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors mr-3" />
      <span className="flex-1 text-muted-foreground text-sm font-medium truncate select-none">
        {placeholder}
      </span>
      <div className="flex items-center gap-1">
        <button 
          className="p-2 hover:bg-muted/30 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Trigger direct Voice Modal in V3
            alert("Mock: Opening Voice Search Modal directly");
          }}
          aria-label="Search by voice"
        >
          <Mic className="w-4 h-4" />
        </button>
        <button 
          className="p-2 hover:bg-muted/30 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Trigger direct Visual Modal in V3
            alert("Mock: Opening Visual/Barcode Search Modal directly");
          }}
          aria-label="Search by image or barcode"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>
      
      {/* Keyboard Shortcut Hint */}
      <div className="absolute right-24 hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-background border border-border rounded text-muted-foreground shadow-sm">Ctrl K</kbd>
      </div>
    </div>
  );
}
