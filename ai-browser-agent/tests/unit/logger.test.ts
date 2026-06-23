import { logger } from '../../src/shared/utils/logger';

describe('Logger', () => {
  it('redacts credential keys', () => {
    const entries: unknown[] = [];
    const unsub = logger.addListener((e) => entries.push(e));

    logger.info('test message', { username: 'admin', password: 'secret123' });

    const last = (entries[entries.length - 1] as { context?: Record<string, unknown> });
    expect(last.context?.password).toBe('[REDACTED]');
    expect(last.context?.username).toBe('admin'); // username is not in sensitive list

    unsub();
  });

  it('does not log credentials even in key names containing token', () => {
    const entries: unknown[] = [];
    const unsub = logger.addListener((e) => entries.push(e));

    logger.info('api call', { apiToken: 'abc123', data: 'ok' });

    const last = (entries[entries.length - 1] as { context?: Record<string, unknown> });
    expect(last.context?.apiToken).toBe('[REDACTED]');
    expect(last.context?.data).toBe('ok');

    unsub();
  });

  it('limits log entries to maxEntries', () => {
    for (let i = 0; i < 1050; i++) {
      logger.info(`log ${i}`);
    }
    expect(logger.getEntries().length).toBeLessThanOrEqual(1000);
  });
});
