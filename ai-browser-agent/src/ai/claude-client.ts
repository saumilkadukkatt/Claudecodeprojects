import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../shared/utils/logger';

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set. Please configure it in your .env file.');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export function resetClient(): void {
  client = null;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function callClaude(
  messages: ClaudeMessage[],
  model: string,
  systemPrompt: string,
  maxTokens = 4096
): Promise<string> {
  const claude = getClaudeClient();

  logger.info('Calling Claude API', { model, messageCount: messages.length });

  const response = await claude.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  return content.text;
}
