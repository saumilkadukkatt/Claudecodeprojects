import { PrismaClient } from '@prisma/client';
import path from 'path';
import { app } from 'electron';
import { logger } from '../../shared/utils/logger';

export class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient | null = null;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    const dbPath = path.join(app.getPath('userData'), 'agent.db');
    process.env.DATABASE_URL = `file:${dbPath}`;

    this.prisma = new PrismaClient({
      datasources: { db: { url: `file:${dbPath}` } },
    });

    await this.prisma.$connect();
    logger.info('Database connected', { path: dbPath });

    // Ensure settings row exists
    await this.prisma.settings.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    });
  }

  getClient(): PrismaClient {
    if (!this.prisma) throw new Error('Database not initialized');
    return this.prisma;
  }

  async close(): Promise<void> {
    await this.prisma?.$disconnect();
    logger.info('Database disconnected');
  }
}
