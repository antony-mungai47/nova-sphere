"use client";

import { useState, useCallback } from "react";
import { Engine } from "../engine/DiscoveryEngine";
import { SearchQuery, SearchResultDTO } from "../engine/types";
import { useSignals } from "../../signals/sdk/hooks";

export function useDiscovery() {
  const [results, setResults] = useState<SearchResultDTO[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { track } = useSignals();

  const search = useCallback(async (query: SearchQuery) => {
    setIsSearching(true);
    track("search.started", "search", { modality: query.modality, rawInput: query.rawInput as string }, true);

    const start = performance.now();
    const data = await Engine.executeSearch(query);
    const latency = performance.now() - start;

    setResults(data);
    setIsSearching(false);

    if (data.length === 0) {
      track("search.zero_results", "search", { query: query.rawInput as string }, true);
    } else {
      track("search.completed", "search", { query: query.rawInput as string, resultCount: data.length, latency }, true);
    }
  }, [track]);

  const clear = useCallback(() => {
    setResults([]);
    track("search.cleared", "search", {}, true);
  }, [track]);

  return { search, results, isSearching, clear };
}

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const fetchSuggestions = useCallback(async (partial: string) => {
    const data = await Engine.getAutocompleteSuggestions(partial);
    setSuggestions(data);
  }, []);

  return { suggestions, fetchSuggestions };
}

// Global UI state for the full-screen overlay
import { create } from "zustand";

interface DiscoveryUIState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useDiscoveryUI = create<DiscoveryUIState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
