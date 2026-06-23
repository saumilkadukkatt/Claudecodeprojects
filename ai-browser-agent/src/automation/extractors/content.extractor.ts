import { Page } from 'playwright';
import { ExtractedContent, ExtractedSection } from '../../shared/types';
import { logger } from '../../shared/utils/logger';

export class ContentExtractor {
  async extract(page: Page): Promise<ExtractedContent> {
    const url = page.url();
    const title = await page.title().catch(() => undefined);

    try {
      return await this.domExtract(page, url, title);
    } catch (error) {
      logger.warn('DOM extraction failed, falling back to text', {
        error: error instanceof Error ? error.message : String(error),
      });
      return await this.textFallback(page, url, title);
    }
  }

  private async domExtract(
    page: Page,
    url: string,
    title: string | undefined
  ): Promise<ExtractedContent> {
    const result = await page.evaluate(() => {
      // Remove non-visible/utility elements
      const remove = ['script', 'style', 'noscript', 'svg', 'iframe', 'nav', 'header', 'footer'];
      const cloneDoc = document.cloneNode(true) as Document;
      remove.forEach((tag) => {
        cloneDoc.querySelectorAll(tag).forEach((el) => el.remove());
      });

      // Extract sections by headings
      const sections: { title?: string; content: string; order: number }[] = [];
      const headings = cloneDoc.querySelectorAll('h1, h2, h3, h4, h5, h6');

      if (headings.length === 0) {
        // No headings — treat whole body as one section
        const body = cloneDoc.body?.innerText || cloneDoc.body?.textContent || '';
        sections.push({ content: body.trim(), order: 0 });
      } else {
        headings.forEach((h, i) => {
          const title = h.textContent?.trim();
          let content = '';

          // Collect sibling nodes until next heading
          let next = h.nextElementSibling;
          while (next && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(next.tagName)) {
            content += ' ' + (next as HTMLElement).innerText || next.textContent || '';
            next = next.nextElementSibling;
          }

          sections.push({ title, content: content.trim(), order: i });
        });
      }

      const rawText =
        (cloneDoc.body as HTMLElement)?.innerText ||
        cloneDoc.body?.textContent ||
        '';

      return { sections, rawText };
    });

    return {
      url,
      title,
      sections: result.sections as ExtractedSection[],
      rawText: result.rawText.replace(/\s+/g, ' ').trim(),
      extractedAt: new Date(),
    };
  }

  private async textFallback(
    page: Page,
    url: string,
    title: string | undefined
  ): Promise<ExtractedContent> {
    const rawText = await page.evaluate(() => document.body.innerText || document.body.textContent || '');
    return {
      url,
      title,
      sections: [{ content: rawText.trim(), order: 0 }],
      rawText: rawText.trim(),
      extractedAt: new Date(),
    };
  }
}
