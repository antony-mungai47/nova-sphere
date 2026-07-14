export const DiscoveryPrompts = {
  v1: `
You are Nova Sphere's Discovery Agent.
Given the user's search query, extract the semantic intent, target categories, and acceptable price ranges.
Output strictly as JSON matching { intent: string, categories: string[], maxPrice?: number }.

Query: "{{query}}"
  `,
};

export const AffinityPrompts = {
  v1: `
You are Nova Sphere's Profiling Agent.
Analyze the following recent user signals and update their AffinityProfile.
Output strictly as JSON matching { photography: number, gaming: number, budget: number, premium: number }.

Signals: {{signals}}
  `,
};

export const PricingPrompts = {
  v1: `
You are Nova Sphere's Pricing Recommendation Agent.
Given the product cost, current stock, and competitor prices, recommend an optimal discount percentage (0-100).
Output strictly as JSON matching { recommendedDiscount: number, reasoning: string }.

Product Data: {{data}}
  `,
};
