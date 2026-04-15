import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  // ==================== 笔记 ====================

  async createNote(childId: string, data: {
    noteType: string;
    title?: string;
    content: string;
    images?: string[];
    relatedCourseId?: string;
    videoTimestamp?: number;
    isPublic?: boolean;
  }) {
    // 检查年龄权限
    const child = await this.prisma.child.findUnique({
      where: { userId: childId },
    });

    if (!child) {
      throw new NotFoundException('儿童账号不存在');
    }

    // 4-6岁只能创建私有笔记
    const isPublic = child.ageGroup === '4-6' ? false : (data.isPublic || false);

    return this.prisma.note.create({
      data: {
        childId,
        noteType: data.noteType,
        title: data.title,
        content: data.content,
        images: data.images || [],
        relatedCourseId: data.relatedCourseId,
        videoTimestamp: data.videoTimestamp,
        isPublic,
      },
    });
  }

  async getNotes(params: {
    childId?: string;
    noteType?: string;
    courseId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { childId, noteType, courseId, page = 1, pageSize = 20 } = params;

    const where: any = {};
    if (childId) where.childId = childId;
    if (noteType) where.noteType = noteType;
    if (courseId) where.relatedCourseId = courseId;

    // 只显示公开笔记或本人笔记
    if (!childId) {
      where.isPublic = true;
    }

    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        include: { child: { select: { nickname: true, avatarId: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.note.count({ where }),
    ]);

    return {
      items: notes,
      pagination: { page, pageSize, total },
    };
  }

  // ==================== 评论 ====================

  async createComment(userId: string, data: {
    targetType: string;
    targetId: string;
    content: string;
    parentId?: string;
  }) {
    // 检查年龄权限（评论仅7岁以上）
    if (userId.startsWith('child')) {
      const child = await this.prisma.child.findUnique({
        where: { userId: userId },
      });

      if (child?.ageGroup === '4-6') {
        throw new BadRequestException('4-6岁儿童暂不支持发表评论');
      }
    }

    return this.prisma.comment.create({
      data: {
        userId,
        targetType: data.targetType,
        targetId: data.targetId,
        parentId: data.parentId,
        content: data.content,
        status: 'pending', // 需审核
      },
    });
  }

  async getComments(targetType: string, targetId: string, page: number = 1, pageSize: number = 20) {
    const where = {
      targetType,
      targetId,
      status: 'approved',
    };

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: { user: { include: { child: true, parent: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      items: comments.map(c => ({
        id: c.id,
        content: c.content,
        likeCount: c.likeCount,
        createdAt: c.createdAt,
        user: c.user.userType === 'child'
          ? { nickname: c.user.child?.nickname, avatarId: c.user.child?.avatarId }
          : { name: c.user.parent?.name },
      })),
      pagination: { page, pageSize, total },
    };
  }

  // ==================== 博客（10岁以上）====================

  async createBlog(childId: string, data: {
    title: string;
    content: string;
    coverImage?: string;
    images?: string[];
    tags?: string[];
  }) {
    // 检查年龄权限
    const child = await this.prisma.child.findUnique({
      where: { userId: childId },
    });

    if (!child || child.ageGroup !== '10-12') {
      throw new BadRequestException('博客功能仅10-12岁儿童可用');
    }

    return this.prisma.blog.create({
      data: {
        childId,
        title: data.title,
        content: data.content,
        coverImageUrl: data.coverImage,
        images: data.images || [],
        tags: data.tags || [],
        status: 'pending_review', // 需家长审核
      },
    });
  }

  async getBlogs(params: {
    childId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { childId, status = 'published', page = 1, pageSize = 20 } = params;

    const where: any = { status };
    if (childId) where.childId = childId;

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        include: { child: { select: { nickname: true, avatarId: true } } },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      items: blogs,
      pagination: { page, pageSize, total },
    };
  }

  // ==================== 群组 ====================

  async createGroup(creatorId: string, data: {
    name: string;
    groupType: string;
    description?: string;
    maxMembers?: number;
    isPublic?: boolean;
  }) {
    return this.prisma.group.create({
      data: {
        name: data.name,
        groupType: data.groupType,
        description: data.description,
        creatorId,
        maxMembers: data.maxMembers,
        isPublic: data.isPublic || false,
        memberCount: 1,
      },
    });
  }

  async joinGroup(groupId: string, userId: string) {
    // 检查是否已加入
    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existing) {
      return existing;
    }

    // 加入群组
    await this.prisma.groupMember.create({
      data: { groupId, userId, role: 'member' },
    });

    // 更新成员数
    await this.prisma.group.update({
      where: { id: groupId },
      data: { memberCount: { increment: 1 } },
    });

    return { joined: true };
  }

  async getGroupMessages(groupId: string, limit: number = 50, before?: string) {
    const where: any = { groupId };
    if (before) where.id = { lt: before };

    const messages = await this.prisma.groupMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse();
  }

  async sendGroupMessage(groupId: string, senderId: string, content: string, messageType: string = 'text') {
    return this.prisma.groupMessage.create({
      data: {
        groupId,
        senderId,
        content,
        messageType,
      },
    });
  }
}