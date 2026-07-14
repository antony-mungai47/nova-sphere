"use client";

import React, { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface ReviewSearchProps {
  onSearch: (query: string) => void;
  onOpenFilters: () => void;
}

export function ReviewSearch({ onSearch, onOpenFilters }: ReviewSearchProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="flex items-center gap-3 w-full sm:max-w-md">
      <form onSubmit={handleSubmit} className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
             setQuery(e.target.value);
             onSearch(e.target.value); // Instant search
          }}
          placeholder="Search reviews..."
          className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cta-primary/50 transition-all"
        />
      </form>
      <button 
        onClick={onOpenFilters}
        className="flex items-center justify-center w-11 h-11 rounded-xl border border-border bg-surface text-foreground hover:bg-surface-hover transition-colors"
        aria-label="Filter Reviews"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </button>
    </div>
  );
}
