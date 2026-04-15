import { VideoSource } from '../../../prisma/client';

// 视频播放凭证
export interface VideoPlayToken {
  type: 'EMBED' | 'DIRECT' | 'HLS';
  embedUrl?: string;      // 用于 iframe 嵌入
  directUrl?: string;     // 直接播放URL
  hlsUrl?: string;        // HLS流
  expiresAt?: Date;      // 过期时间
}

// 视频元信息
export interface VideoMeta {
  title: string;
  thumbnail: string;
  duration: number;
  platform: VideoSource;
}

// 视频服务接口（适配器模式）
export interface IVideoProvider {
  // 获取嵌入代码/播放凭证
  getPlayToken(externalId: string): Promise<VideoPlayToken>;

  // 获取视频元信息
  getVideoMeta(externalId: string): Promise<VideoMeta>;

  // 校验视频是否有效/可访问
  validateVideo(externalId: string): Promise<boolean>;

  // 获取平台名称
  getPlatformName(): string;
}
