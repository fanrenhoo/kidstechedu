import { Injectable } from '@nestjs/common';
import { IVideoProvider, VideoPlayToken, VideoMeta } from '../interfaces/video-provider.interface';
import { VideoSource } from '../../../prisma/client';

@Injectable()
export class BilibiliProvider implements IVideoProvider {
  private readonly PLAYER_BASE_URL = 'https://player.bilibili.com/player.html';

  async getPlayToken(externalId: string): Promise<VideoPlayToken> {
    // Bilibili 使用 BV号 作为 externalId
    const embedUrl = `${this.PLAYER_BASE_URL}?bvid=${externalId}&high_quality=1&as_wide=1`;

    return {
      type: 'EMBED',
      embedUrl,
      expiresAt: undefined, // Bilibili embed URL 不过期
    };
  }

  async getVideoMeta(externalId: string): Promise<VideoMeta> {
    // 实际项目中应该调用Bilibili API获取元信息
    // 这里返回基本结构，实际使用时需要调用第三方API
    return {
      title: 'B站视频',
      thumbnail: '',
      duration: 0,
      platform: VideoSource.BILIBILI,
    };
  }

  async validateVideo(externalId: string): Promise<boolean> {
    // BV号格式校验：BV + 10位字母数字组合
    const bvPattern = /^BV[A-Za-z0-9]{10}$/;
    return bvPattern.test(externalId);
  }

  getPlatformName(): string {
    return 'bilibili';
  }
}
