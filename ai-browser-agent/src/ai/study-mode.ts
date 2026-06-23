import { StudyOutputType } from '../shared/types';
import { callClaude } from './claude-client';
import { SYSTEM_PROMPTS, buildStudyModePrompt } from './prompt-builder';
import { logger } from '../shared/utils/logger';

export interface StudyModeResult {
  content: string;
  types: StudyOutputType[];
}

export async function generateStudyMaterials(
  content: string,
  types: StudyOutputType[],
  model: string
): Promise<StudyModeResult> {
  logger.info('Generating study materials', { types });

  const userPrompt = buildStudyModePrompt(content, types);

  const result = await callClaude(
    [{ role: 'user', content: userPrompt }],
    model,
    SYSTEM_PROMPTS.studyMode,
    8192
  );

  logger.info('Study materials generated', { length: result.length });

  return { content: result, types };
}

export async function generateGeneralResponse(
  instruction: string,
  content: string,
  model: string
): Promise<string> {
  logger.info('Generating general AI response');

  const { buildGeneralPrompt } = await import('./prompt-builder');
  const userPrompt = buildGeneralPrompt(instruction, content);

  return callClaude(
    [{ role: 'user', content: userPrompt }],
    model,
    SYSTEM_PROMPTS.general,
    4096
  );
}
