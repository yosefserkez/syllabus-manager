import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { syllabusSchema } from '@/lib/schemas';
import { zodResponseFormat } from "openai/helpers/zod";

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a syllabus parsing assistant. Extract semester, course, and task information from the provided syllabus text.

Important rules:
1. Only extract actual tasks with clear due dates
2. Ignore general course policies or requirements
3. Course code must follow format: 2-4 letters followed by 3-4 numbers (e.g., CS101)
4. Task titles should be concise and clear
5. Dates must be within 5 years from now
6. Maximum 100 tasks allowed

CRITICAL: Extract as much information as possible, but it's okay if some fields are missing.`;

const USER_PROMPT = (text: string) => `Parse the following syllabus and extract the required information:

${text}

Remember:
1. Include all assignments, readings, tests, and due dates
2. Use YYYY-MM-DD format for dates
3. Set all task status to "not-started"
4. Categorize tasks appropriately
5. Include course instructor if available
6. Follow course code format (e.g., CS101)
7. It's okay to leave fields empty if the information is not clearly stated`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body?.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing text' },
        { status: 400 }
      );
    }

    // Limit text length
    const MAX_TEXT_LENGTH = 50000;
    if (body.text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: 'Text too long (maximum 50,000 characters)' },
        { status: 400 }
      );
    }

    // Call OpenAI API
    let completion;
    try {
      completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-mini-2024-07-18",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: USER_PROMPT(body.text) }
        ],
        response_format: zodResponseFormat(syllabusSchema, "syllabus"),
        temperature: 0.2,
        max_tokens: 4000,
      });

      return NextResponse.json(completion.choices[0].message.parsed);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to process syllabus' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error parsing syllabus:', error);
    return NextResponse.json(
      { error: 'Failed to parse syllabus' },
      { status: 500 }
    );
  }
}