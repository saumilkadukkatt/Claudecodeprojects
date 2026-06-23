import { buildStudyModePrompt, buildTaskInterpretPrompt, buildGeneralPrompt } from '../../src/ai/prompt-builder';

describe('PromptBuilder', () => {
  it('builds study mode prompt with correct sections', () => {
    const prompt = buildStudyModePrompt('Some content here', ['key_concepts', 'flashcards']);
    expect(prompt).toContain('Key Concepts');
    expect(prompt).toContain('Flashcards');
    expect(prompt).toContain('Some content here');
  });

  it('truncates very long content in study mode', () => {
    const longContent = 'x'.repeat(20000);
    const prompt = buildStudyModePrompt(longContent, ['simple_summary']);
    // Should be truncated to 15000 chars of content
    expect(prompt.length).toBeLessThan(20000);
  });

  it('builds task interpret prompt', () => {
    const prompt = buildTaskInterpretPrompt('click the login button', 'Login page content');
    expect(prompt).toContain('click the login button');
    expect(prompt).toContain('Login page content');
  });

  it('builds general prompt', () => {
    const prompt = buildGeneralPrompt('summarize this', 'Some page content');
    expect(prompt).toContain('summarize this');
  });
});
