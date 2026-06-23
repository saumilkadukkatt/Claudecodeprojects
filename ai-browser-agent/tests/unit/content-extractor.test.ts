import { ContentExtractor } from '../../src/automation/extractors/content.extractor';

// Mock Playwright Page
function createMockPage(evalResult: { sections: { title?: string; content: string; order: number }[]; rawText: string }) {
  return {
    url: () => 'https://example.com/test',
    title: () => Promise.resolve('Test Page'),
    evaluate: (_fn: unknown) => Promise.resolve(evalResult),
  } as unknown;
}

describe('ContentExtractor', () => {
  const extractor = new ContentExtractor();

  it('extracts sections from DOM', async () => {
    const mockPage = createMockPage({
      sections: [
        { title: 'Introduction', content: 'This is intro content', order: 0 },
        { title: 'Chapter 1', content: 'Chapter one content', order: 1 },
      ],
      rawText: 'Introduction This is intro content Chapter 1 Chapter one content',
    });

    const result = await extractor.extract(mockPage as Parameters<typeof extractor.extract>[0]);

    expect(result.url).toBe('https://example.com/test');
    expect(result.title).toBe('Test Page');
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].title).toBe('Introduction');
  });

  it('sets extractedAt to current date', async () => {
    const before = Date.now();
    const mockPage = createMockPage({ sections: [], rawText: '' });
    const result = await extractor.extract(mockPage as Parameters<typeof extractor.extract>[0]);
    expect(result.extractedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});
