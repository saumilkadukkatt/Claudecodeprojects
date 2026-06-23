import { Page } from 'playwright';
import { BasePlugin } from '../base-plugin';
import { ExtractedContent, PluginInfo } from '../../shared/types';
import { logger } from '../../shared/utils/logger';

export class SapPressPlugin extends BasePlugin {
  get info(): PluginInfo {
    return {
      name: 'sap-press',
      displayName: 'SAP PRESS',
      urlPattern: /sap-press\.com|saplearninghub\.plateau\.com/i,
      version: '1.0.0',
      description: 'SAP PRESS e-library reader',
    };
  }

  async login(page: Page, username: string, _password: string): Promise<void> {
    logger.info('SAP PRESS login initiated');
    // Navigate to login and fill form
    await page.fill('[name="username"], [type="email"]', username);
    // Password fill handled by automation engine — never logged
    await page.click('[type="submit"]');
    await page.waitForLoadState('networkidle');
  }

  async extractContent(page: Page): Promise<ExtractedContent> {
    const url = page.url();
    const title = await page.title();

    const sections = await page.evaluate(() => {
      const result: { title?: string; content: string; order: number }[] = [];
      const headings = document.querySelectorAll('h1, h2, h3, h4');
      headings.forEach((h, i) => {
        let content = '';
        let next = h.nextElementSibling;
        while (next && !['H1', 'H2', 'H3', 'H4'].includes(next.tagName)) {
          content += ' ' + ((next as HTMLElement).innerText || next.textContent || '');
          next = next.nextElementSibling;
        }
        result.push({ title: h.textContent?.trim(), content: content.trim(), order: i });
      });
      return result;
    });

    const rawText = sections.map((s) => `${s.title || ''}\n${s.content}`).join('\n\n');

    return { url, title, sections, rawText, extractedAt: new Date() };
  }
}
