import { Browser, BrowserContext, Page, chromium } from 'playwright';
import { BrowserAction } from '../../shared/types';
import { logger } from '../../shared/utils/logger';
import { ContentExtractor } from '../../automation/extractors/content.extractor';

export type BrowserEventType =
  | 'launched'
  | 'navigated'
  | 'closed'
  | 'mfa-detected'
  | 'captcha-detected'
  | 'error'
  | 'page-content';

export interface BrowserEvent {
  type: BrowserEventType;
  url?: string;
  content?: string;
  screenshot?: string;
  error?: string;
}

type EventListener = (event: BrowserEvent) => void;

export class BrowserService {
  private static instance: BrowserService;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private listeners: EventListener[] = [];
  private paused = false;
  private stopped = false;
  private extractor: ContentExtractor;

  constructor() {
    this.extractor = new ContentExtractor();
  }

  static getInstance(): BrowserService {
    if (!BrowserService.instance) {
      BrowserService.instance = new BrowserService();
    }
    return BrowserService.instance;
  }

  addEventListener(listener: EventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(event: BrowserEvent) {
    this.listeners.forEach((l) => l(event));
  }

  async launch(url: string, headless = false): Promise<void> {
    if (this.browser) {
      await this.close();
    }

    this.paused = false;
    this.stopped = false;

    this.browser = await chromium.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    });

    this.page = await this.context.newPage();

    // Detect MFA/captcha patterns
    this.page.on('load', async () => {
      await this.detectSpecialPages();
    });

    await this.navigate(url);
    this.emit({ type: 'launched', url });
    logger.info('Browser launched', { url, headless });
  }

  private async detectSpecialPages() {
    if (!this.page) return;
    const content = await this.page.content().catch(() => '');
    const lower = content.toLowerCase();
    if (
      lower.includes('captcha') ||
      lower.includes('recaptcha') ||
      lower.includes('hcaptcha')
    ) {
      this.emit({ type: 'captcha-detected', url: this.page.url() });
      logger.warn('Captcha detected — pausing automation');
      this.paused = true;
    }
    if (
      lower.includes('two-factor') ||
      lower.includes('2fa') ||
      lower.includes('verify your identity') ||
      lower.includes('enter the code')
    ) {
      this.emit({ type: 'mfa-detected', url: this.page.url() });
      logger.warn('MFA detected — waiting for user');
      this.paused = true;
    }
  }

  async navigate(url: string): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    this.emit({ type: 'navigated', url });
    logger.info('Navigated', { url });
  }

  async executeAction(action: BrowserAction): Promise<string> {
    if (!this.page) throw new Error('Browser not launched');
    if (this.stopped) throw new Error('Automation stopped');

    // Wait while paused
    while (this.paused && !this.stopped) {
      await new Promise((r) => setTimeout(r, 500));
    }
    if (this.stopped) throw new Error('Automation stopped');

    logger.info(`Executing action: ${action.type}`, { target: action.target });

    switch (action.type) {
      case 'navigate':
        await this.navigate(action.value!);
        return `Navigated to ${action.value}`;

      case 'click':
        await this.page.click(action.target!, { timeout: 10000 });
        await this.page.waitForLoadState('domcontentloaded').catch(() => null);
        return `Clicked ${action.target}`;

      case 'type':
        await this.page.fill(action.target!, action.value!);
        return `Typed into ${action.target}`;

      case 'scroll':
        await this.page.evaluate((pixels) => window.scrollBy(0, pixels), parseInt(action.value || '500'));
        return 'Scrolled page';

      case 'extract':
        return await this.extractContent();

      case 'wait':
        await this.page.waitForTimeout(parseInt(action.value || '2000'));
        return 'Waited';

      case 'back':
        await this.page.goBack({ waitUntil: 'domcontentloaded' });
        return 'Navigated back';

      case 'forward':
        await this.page.goForward({ waitUntil: 'domcontentloaded' });
        return 'Navigated forward';

      case 'select':
        await this.page.selectOption(action.target!, action.value!);
        return `Selected ${action.value} in ${action.target}`;

      case 'screenshot':
        return await this.takeScreenshot();

      case 'save':
        return await this.extractContent();

      case 'download':
        // Downloads must be explicitly user-initiated
        logger.info('Download action — requires explicit user confirmation');
        return 'Download initiated (requires user confirmation)';

      default:
        return `Unknown action: ${action.type}`;
    }
  }

  async extractContent(): Promise<string> {
    if (!this.page) throw new Error('Browser not launched');
    const content = await this.extractor.extract(this.page);
    this.emit({ type: 'page-content', content: content.rawText, url: this.page.url() });
    return content.rawText;
  }

  async getPageContent(): Promise<string> {
    return this.extractContent();
  }

  async getPageUrl(): Promise<string> {
    return this.page?.url() ?? '';
  }

  async getPageTitle(): Promise<string> {
    return this.page?.title() ?? '';
  }

  async takeScreenshot(): Promise<string> {
    if (!this.page) throw new Error('Browser not launched');
    const buffer = await this.page.screenshot({ type: 'png' });
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }

  pause(): void {
    this.paused = true;
    logger.info('Automation paused');
  }

  resume(): void {
    this.paused = false;
    logger.info('Automation resumed');
  }

  stop(): void {
    this.stopped = true;
    this.paused = false;
    logger.info('Automation stopped');
  }

  isPaused(): boolean {
    return this.paused;
  }

  isStopped(): boolean {
    return this.stopped;
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
    this.page = null;
    this.context = null;
    this.browser = null;
    this.emit({ type: 'closed' });
    logger.info('Browser closed');
  }

  isLaunched(): boolean {
    return this.browser !== null;
  }
}
