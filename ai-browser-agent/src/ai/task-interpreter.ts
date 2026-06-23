import { v4 as uuidv4 } from 'uuid';
import { BrowserAction, BrowserActionSchema } from '../shared/types';
import { callClaude } from './claude-client';
import { SYSTEM_PROMPTS, buildTaskInterpretPrompt } from './prompt-builder';
import { logger } from '../shared/utils/logger';
import { z } from 'zod';

const ActionsResponseSchema = z.object({
  actions: z.array(BrowserActionSchema),
  summary: z.string(),
});

export interface InterpretResult {
  actions: BrowserAction[];
  summary: string;
}

export async function interpretTask(
  instruction: string,
  pageContent: string,
  model: string
): Promise<InterpretResult> {
  logger.info('Interpreting task', { instruction: instruction.slice(0, 100) });

  const userPrompt = buildTaskInterpretPrompt(instruction, pageContent);

  const response = await callClaude(
    [{ role: 'user', content: userPrompt }],
    model,
    SYSTEM_PROMPTS.taskInterpreter,
    2048
  );

  // Extract JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI did not return valid JSON actions');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const validated = ActionsResponseSchema.parse({
    ...parsed,
    actions: (parsed.actions || []).map((a: Partial<BrowserAction>) => ({
      ...a,
      id: a.id || uuidv4(),
      status: 'pending',
    })),
  });

  logger.info('Task interpreted', {
    actionCount: validated.actions.length,
    summary: validated.summary,
  });

  return validated;
}
