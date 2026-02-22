/**
 * OpenAI Chat Completions + Whisper (speech-to-text).
 * Set EXPO_PUBLIC_OPENAI_API_KEY in .env (see .env.example).
 * Loaded via app.config.js -> extra.openaiApiKey.
 */

import Constants from 'expo-constants';

function getOpenAIKey(): string {
  const fromEnv = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (fromEnv) return fromEnv;
  const fromExtra = (Constants.expoConfig as { extra?: { openaiApiKey?: string } } | null)?.extra?.openaiApiKey;
  return fromExtra ?? '';
}

const OPENAI_API_KEY = getOpenAIKey();

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export async function chat(messages: ChatMessage[]): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      'EXPO_PUBLIC_OPENAI_API_KEY is not set. Create .env from .env.example and set your key, then restart with: npx expo start --clear'
    );
  }
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: 1024,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `OpenAI API error: ${res.status}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim();
  return content ?? '';
}

/**
 * Transcribe audio URI (file://) to text using Whisper.
 * Pass the local file URI from expo-av recording.
 */
export async function transcribeAudio(uri: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error(
      'EXPO_PUBLIC_OPENAI_API_KEY is not set. Create .env from .env.example and set your key, then restart with: npx expo start --clear'
    );
  }

  const ext = uri.includes('.m4a') ? 'm4a' : uri.includes('.caf') ? 'caf' : 'm4a';
  const mime = ext === 'caf' ? 'audio/x-caf' : 'audio/m4a';
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: mime,
    name: `recording.${ext}`,
  } as unknown as Blob);
  formData.append('model', 'whisper-1');

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `Whisper API error: ${res.status}`);
  }
  const data = (await res.json()) as { text?: string };
  return (data.text ?? '').trim();
}

export function hasOpenAIKey(): boolean {
  return !!OPENAI_API_KEY;
}
