"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export function usePersonalization() {
  const { isSignedIn, userId } = useAuth();
  const [greeting, setGreeting] = useState("Discover Amazing Deals");

  useEffect(() => {
    const hour = new Date().getHours();
    let timeGreeting = "";

    if (hour < 12) timeGreeting = "Good Morning ☀️";
    else if (hour < 14) timeGreeting = "Deals Ending Before Lunch";
    else if (hour < 18) timeGreeting = "Good Afternoon 👋";
    else timeGreeting = "Tonight's Flash Deals";

    if (isSignedIn) {
      // In a real app, we'd fetch the user's first name here.
      // For now, we simulate personalization.
      
      setTimeout(() => setGreeting(`Welcome Back • ${timeGreeting}`), 0);
    } else {
      
      setTimeout(() => setGreeting(timeGreeting), 0);
    }
  }, [isSignedIn, userId]);

  return { greeting };
}
