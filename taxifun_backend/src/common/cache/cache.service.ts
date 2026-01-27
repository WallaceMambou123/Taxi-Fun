import { Injectable, Logger } from '@nestjs/common';

/**
 * Service de cache en mémoire (fallback quand Redis n'est pas disponible)
 * Pour la production, utiliser Redis
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, { value: string; expiresAt: number }>();

  constructor() {
    // Nettoyage automatique toutes les 5 minutes
    setInterval(() => this.cleanup(), 300000);
    this.logger.log('CacheService initialized (in-memory mode)');
  }

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    let count = 0;
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }
    if (count > 0) {
      this.logger.log(`Cleaned up ${count} expired cache entries`);
    }
  }
}
