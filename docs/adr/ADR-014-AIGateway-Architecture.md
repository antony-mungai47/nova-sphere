# AI gateway architecture\n\n**Date:** July 2026
**Status:** Accepted
**Context:** We use AI for search semantic analysis and recommendation. Hitting OpenAI directly from client requests exposes keys and lacks rate limiting.
**Decision:** We implemented an AI Gateway pattern.
**Consequences:**
- All AI requests pass through our backend `AIEngine`.
- Enables prompt caching, semantic cache lookups, and cost control.
- Allows us to swap underlying LLM providers without touching frontend code.\n