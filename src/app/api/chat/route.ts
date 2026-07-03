import { type ModelMessage } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { ContextEngine } from '@/domains/Intelligence/ContextEngine/ContextEngine';
import { SafetyEngine } from '@/domains/Intelligence/SafetyEngine/SafetyEngine';
import { ToolRegistry } from '@/domains/Intelligence/ToolRegistry/ToolRegistry';
import { VercelOpenAI } from '@/domains/Intelligence/AIEngine/Providers/VercelOpenAI';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: ModelMessage[] } = await req.json();

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      const isSafe = SafetyEngine.scanPrompt(lastMessage.content as string);
      if (!isSafe) {
        return NextResponse.json({ error: 'Prompt blocked by Safety Engine.' }, { status: 400 });
      }
    }

    const { userId } = await auth();
    const context = await ContextEngine.assembleContext({ userId: userId || undefined });
    const systemPrompt = ContextEngine.formatForPrompt(context);
    
    // Choose mode based on user role (assistant vs admin)
    const modePrompt = context.role === 'admin' 
      ? 'You are Nova Admin Copilot. Assist with platform analytics, user management, and configuration.'
      : 'You are Nova, an intelligent shopping concierge for Nova Sphere. Assist with products, orders, and auctions.';
      
    const finalSystemPrompt = `${modePrompt}\n\n${systemPrompt}`;

    const tools = ToolRegistry.getToolsForContext(context);
    const aiProvider = new VercelOpenAI(); // Could swap based on feature flags

    const result = await aiProvider.stream({
      messages,
      systemPrompt: finalSystemPrompt,
      tools,
      maxSteps: 3
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('[Chat API Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
