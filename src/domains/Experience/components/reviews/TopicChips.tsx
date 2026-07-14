"use client";

import React from "react";

interface TopicChipsProps {
  topics: { name: string; count: number }[];
  activeTopic?: string;
  onSelectTopic: (topic: string | undefined) => void;
}

export function TopicChips({ topics, activeTopic, onSelectTopic }: TopicChipsProps) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm font-bold text-foreground mr-2">Top Mentions:</span>
      <button
        onClick={() => onSelectTopic(undefined)}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
          !activeTopic 
            ? "bg-foreground text-background border-foreground" 
            : "bg-surface text-muted-foreground border-border hover:bg-muted"
        }`}
      >
        All
      </button>
      {topics.map((topic, i) => (
        <button
          key={i}
          onClick={() => onSelectTopic(topic.name === activeTopic ? undefined : topic.name)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            topic.name === activeTopic 
              ? "bg-cta-primary text-cta-primary-foreground border-cta-primary" 
              : "bg-surface text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          {topic.name} <span className="opacity-70 ml-1">({topic.count})</span>
        </button>
      ))}
    </div>
  );
}
