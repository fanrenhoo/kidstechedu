import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { IVideoProvider, VideoPlayToken, VideoMeta } from './interfaces/video-provider.interface';
import { BilibiliProvider } from './providers/bilibili.provider';
import { VideoSource } from '../../prisma/client';

@Injectable()
export class VideoService {
  // 视频提供者的Map，用于动态路由
  private providers: Map<VideoSource, IVideoProvider>;

  constructor(
    private prisma: PrismaService,
    private bilibiliProvider: BilibiliProvider,
  ) {
    // 初始化提供者映射
    this.providers = new Map<VideoSource, IVideoProvider>();
    this.providers.set(VideoSource.BILIBILI, this.bilibiliProvider);
    // TODO: 后续添加其他平台适配器
    // this.providers.set(VideoSource.DOUYIN, this.douyinProvider);
    // this.providers.set(VideoSource.WECHAT_VIDEO, this.wechatProvider);
    // this.providers.set(VideoSource.XIAOHONGSHU, this.xiaohongshuProvider);
    // this.providers.set(VideoSource.SELF_UPLOAD, this.selfUploadProvider);
  }

  /**
   * 获取视频播放凭证
   * 根据视频source类型路由到对应的平台适配器
   */
  async getPlayToken(videoId: string): Promise<any> {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('视频不存在');
    }

    // 自建上传视频直接返回播放信息
    if (video.source === VideoSource.SELF_UPLOAD) {
      return {
        videoId: video.id,
        source: video.source,
        type: 'HLS',
        hlsUrl: video.transcodedUrls ? JSON.parse(JSON.stringify(video.transcodedUrls)).hls : null,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
      };
    }

    // 第三方视频获取播放凭证
    const provider = this.providers.get(video.source);
    if (!provider) {
      throw new NotFoundException(`不支持的视频源类型: ${video.source}`);
    }

    if (!video.externalId) {
      throw new NotFoundException('视频的externalId不存在');
    }

    const playToken = await provider.getPlayToken(video.externalId);

    return {
      videoId: video.id,
      source: video.source,
      ...playToken,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
    };
  }

  /**
   * 获取视频元信息
   */
  async getVideoMeta(videoId: string): Promise<VideoMeta> {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('视频不存在');
    }

    // 自建上传视频
    if (video.source === VideoSource.SELF_UPLOAD) {
      return {
        title: video.title || '未命名视频',
        thumbnail: video.thumbnailUrl || '',
        duration: video.duration || 0,
        platform: VideoSource.SELF_UPLOAD,
      };
    }

    // 第三方视频
    const provider = this.providers.get(video.source);
    if (!provider) {
      throw new NotFoundException(`不支持的视频源类型: ${video.source}`);
    }

    if (!video.externalId) {
      throw new NotFoundException('视频的externalId不存在');
    }

    return provider.getVideoMeta(video.externalId);
  }

  /**
   * 校验视频是否有效
   */
  async validateVideo(videoId: string): Promise<boolean> {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return false;
    }

    // 自建上传视频校验状态
    if (video.source === VideoSource.SELF_UPLOAD) {
      return video.status === 'ready';
    }

    // 第三方视频校验externalId格式
    const provider = this.providers.get(video.source);
    if (!provider || !video.externalId) {
      return false;
    }

    return provider.validateVideo(video.externalId);
  }

  /**
   * 根据source获取对应的provider
   */
  getProvider(source: VideoSource): IVideoProvider | undefined {
    return this.providers.get(source);
  }
}
