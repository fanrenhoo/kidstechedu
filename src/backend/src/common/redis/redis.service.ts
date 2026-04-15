import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get('REDIS_URL') || 'redis://localhost:6379';
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => console.log('✅ Redis connected'));

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
    console.log('❌ Redis disconnected');
  }

  // ==================== 基础操作 ====================

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    if (expireSeconds) {
      await this.client.setEx(key, expireSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // ==================== JSON操作 ====================

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, expireSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), expireSeconds);
  }

  // ==================== 会话管理 ====================

  async setSession(sessionId: string, sessionData: object, expireSeconds: number = 3600): Promise<void> {
    await this.setJson(`session:${sessionId}`, sessionData, expireSeconds);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return this.getJson<T>(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // ==================== 用户登录状态 ====================

  async setUserLogin(userId: string, data: object, expireSeconds: number = 604800): Promise<void> {
    await this.setJson(`user:login:${userId}`, data, expireSeconds);
  }

  async getUserLogin(userId: string): Promise<object | null> {
    return this.getJson(`user:login:${userId}`);
  }

  async deleteUserLogin(userId: string): Promise<void> {
    await this.del(`user:login:${userId}`);
  }

  // ==================== 登录尝试限制 ====================

  async incrementLoginAttempts(userId: string, maxAttempts: number = 5): Promise<number> {
    const key = `login:attempts:${userId}`;
    const current = await this.get(key);
    const attempts = current ? parseInt(current) + 1 : 1;
    await this.set(key, String(attempts), 900); // 15分钟过期
    return attempts;
  }

  async getLoginAttempts(userId: string): Promise<number> {
    const key = `login:attempts:${userId}`;
    const current = await this.get(key);
    return current ? parseInt(current) : 0;
  }

  async clearLoginAttempts(userId: string): Promise<void> {
    await this.del(`login:attempts:${userId}`);
  }

  // ==================== 缓存 ====================

  async cacheCourseDetail(courseId: string, data: object, expireSeconds: number = 600): Promise<void> {
    await this.setJson(`course:detail:${courseId}`, data, expireSeconds);
  }

  async getCachedCourseDetail(courseId: string): Promise<object | null> {
    return this.getJson(`course:detail:${courseId}`);
  }

  async cacheUserProgress(userId: string, courseId: string, data: object, expireSeconds: number = 1800): Promise<void> {
    await this.setJson(`progress:user:${userId}:course:${courseId}`, data, expireSeconds);
  }

  async getCachedUserProgress(userId: string, courseId: string): Promise<object | null> {
    return this.getJson(`progress:user:${userId}:course:${courseId}`);
  }

  // ==================== 每日学习时长 ====================

  async incrementDailyTime(childId: string, minutes: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily:time:${childId}:${today}`;
    const current = await this.get(key);
    const total = current ? parseInt(current) + minutes : minutes;
    await this.set(key, String(total), 86400); // 到当天结束
    return total;
  }

  async getDailyTime(childId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily:time:${childId}:${today}`;
    const current = await this.get(key);
    return current ? parseInt(current) : 0;
  }

  // ==================== 分布式锁 ====================

  async acquireLock(resourceId: string, ownerId: string, expireSeconds: number = 30): Promise<boolean> {
    const key = `lock:resource:${resourceId}`;
    const result = await this.client.set(key, ownerId, {
      NX: true,
      EX: expireSeconds,
    });
    return result === 'OK';
  }

  async releaseLock(resourceId: string, ownerId: string): Promise<boolean> {
    const key = `lock:resource:${resourceId}`;
    const currentOwner = await this.get(key);
    if (currentOwner === ownerId) {
      await this.del(key);
      return true;
    }
    return false;
  }

  // ==================== 异步队列（简单实现）====================

  async pushTask(queueName: string, task: object): Promise<void> {
    await this.client.rPush(`queue:${queueName}`, JSON.stringify(task));
  }

  async popTask(queueName: string): Promise<object | null> {
    const result = await this.client.lPop(`queue:${queueName}`);
    return result ? JSON.parse(result) : null;
  }

  async getQueueLength(queueName: string): Promise<number> {
    return this.client.lLen(`queue:${queueName}`);
  }
}