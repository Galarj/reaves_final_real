import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NOTEBOOK_CHAT_SYSTEM_PROMPT } from '@/prompts/notebook-chat';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messages, sources } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    // Build a context block from all notebook sources
    const sourceContext = (sources || [])
      .map((s: any, i: number) =>
        `[Source ${i + 1}] "${s.title}" by ${s.authors} (${s.year})
Journal: ${s.journal}
Trust Score: ${s.trust_score}/100 — ${s.trust_reason}
Abstract: ${s.abstract}
${s.user_note ? `User Note: ${s.user_note}` : ''}
${s.tag ? `Tag: ${s.tag}` : ''}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = NOTEBOOK_CHAT_SYSTEM_PROMPT +
      '\n\n--- NOTEBOOK SOURCES ---\n\n' + sourceContext;

    // Use Gemini in NON-JSON mode for natural conversational replies
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: { temperature: 0.5 },
    });

    // Build the chat history (all messages except the last one which is the current user message)
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('[/api/notebook-chat]', error);
    return NextResponse.json(
      { error: 'Failed to generate chat response', details: String(error) },
      { status: 500 }
    );
  }
}
