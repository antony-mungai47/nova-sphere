import { NextResponse } from 'next/server';
// import { CoreMessage, streamText } from 'ai';
// import { openai } from '@ai-sdk/openai';

// export const runtime = 'edge';

export async function POST(req: Request) {
  // const { messages }: { messages: CoreMessage[] } = await req.json();

  // const result = await streamText({
  //   model: openai('gpt-4o'),
  //   messages,
  //   system: 'You are Nova, an intelligent shopping assistant for Nova Sphere.',
  // });

  // return result.toDataStreamResponse();
  
  return NextResponse.json({ message: 'AI endpoint is scaffolded.' });
}
