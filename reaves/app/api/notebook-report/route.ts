import { NextRequest, NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { NOTEBOOK_REPORT_SYSTEM_PROMPT } from '@/prompts/notebook-report';

export async function POST(req: NextRequest) {
  try {
    const { source, userNote, tag } = await req.json();

    if (!source || !source.title) {
      return NextResponse.json({ error: 'source is required' }, { status: 400 });
    }

    const userMessage = `Generate a research summary report for this source:

Title: ${source.title}
Authors: ${source.authors}
Year: ${source.year}
Journal: ${source.journal}
Trust Score: ${source.trust_score}/100
Trust Reason: ${source.trust_reason}
Abstract: ${source.abstract}
DOI: ${source.doi || 'N/A'}
${tag ? `User Tag: ${tag}` : ''}
${userNote ? `User Notes: ${userNote}` : 'No user notes provided.'}`;

    const result = await callClaude(NOTEBOOK_REPORT_SYSTEM_PROMPT, userMessage) as { summary: string };
    return NextResponse.json(result);
  } catch (error) {
    console.error('[/api/notebook-report]', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: String(error) },
      { status: 500 }
    );
  }
}
