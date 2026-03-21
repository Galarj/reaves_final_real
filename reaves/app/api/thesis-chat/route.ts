import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { THESIS_CHAT_SYSTEM_PROMPT } from '@/prompts/thesis-chat';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { messages, thesis, sources } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    // Build thesis context block
    const thesisContext = `
THESIS STATEMENT: ${thesis.thesis}
STANCE: ${thesis.stance}
RESEARCH GAP FILLED: ${thesis.gap_it_fills}
SUPPORTING SOURCES: ${(thesis.supporting_sources || []).join(', ')}
`.trim();

    // Build sources context
    const sourceContext = (sources || [])
      .map((s: any, i: number) =>
        `[Source ${i + 1}] "${s.title}" by ${s.authors} (${s.year})\nAbstract: ${s.abstract}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = THESIS_CHAT_SYSTEM_PROMPT +
      '\n\n--- THESIS CONTEXT ---\n\n' + thesisContext +
      '\n\n--- NOTEBOOK SOURCES ---\n\n' + sourceContext;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: { temperature: 0.5 },
    });

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
    console.error('[/api/thesis-chat]', error);
    return NextResponse.json(
      { error: 'Failed to generate thesis chat response', details: String(error) },
      { status: 500 }
    );
  }
}
