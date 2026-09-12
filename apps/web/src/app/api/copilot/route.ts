import { NextRequest, NextResponse } from 'next/server';
import { extractParametersFromPrompt } from '@/lib/copilot';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body.prompt || '';
    const currentParams = body.currentParams || {};

    // Execute deterministic rule-based extractor
    const result = extractParametersFromPrompt(prompt, currentParams);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to process copilot query' },
      { status: 500 }
    );
  }
}
