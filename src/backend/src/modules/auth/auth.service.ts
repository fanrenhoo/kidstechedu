import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { UserService } from '../user/user.service';
import {
  ParentRegisterDto,
  ChildCreateDto,
  ParentLoginDto,
  ChildLoginDto,
  LoginResponseDto,
} from './dto/auth.dto';
import { AgeGroup } from '../../common/constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  // ==================== 家长注册 ====================

  async registerParent(dto: ParentRegisterDto): Promise<LoginResponseDto> {
    // 检查手机号/邮箱是否已存在
    const existingParent = await this.prisma.parent.findFirst({
      where: {
        OR: [
          { phone: dto.phone },
          { email: dto.email },
        ],
      },
    });

    if (existingParent) {
      throw new BadRequestException('手机号或邮箱已被注册');
    }

    // 创建用户
    const user = await this.prisma.user.create({
      data: { userType: 'parent' },
    });

    // 创建家长信息
    const parent = await this.prisma.parent.create({
      data: {
        userId: user.id,
        phone: dto.phone,
        email: dto.email,
        name: dto.name,
        verificationStatus: 'verified',
      },
    });

    // 创建密码凭证
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    await this.prisma.userCredential.create({
      data: {
        userId: user.id,
        credentialType: 'password',
        credentialHash: hashedPassword,
        isPrimary: true,
      },
    });

    // 生成Token
    const tokens = await this.generateTokens(user.id, 'parent');

    return {
      userId: user.id,
      userType: 'parent',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      profile: {
        id: parent.userId,
        phone: parent.phone,
        email: parent.email,
        name: parent.name,
      },
    };
  }

  // ==================== 创建儿童账号 ====================

  async createChild(parentId: string, dto: ChildCreateDto): Promise<any> {
    // 验证家长
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentId },
    });

    if (!parent) {
      throw new UnauthorizedException('家长账号不存在');
    }

    // 计算年龄分组
    const ageGroup = this.calculateAgeGroup(dto.birthDate);

    // 创建用户
    const user = await this.prisma.user.create({
      data: { userType: 'child' },
    });

    // 创建儿童信息
    const child = await this.prisma.child.create({
      data: {
        userId: user.id,
        nickname: dto.nickname,
        birthDate: new Date(dto.birthDate),
        gender: dto.gender,
        ageGroup,
        preferences: {
          interests: dto.learningGoals?.interests || [],
          target: dto.learningGoals?.target || 'interest',
          customGoal: dto.learningGoals?.customGoal || '',
        },
      },
    });

    // 创建关联
    await this.prisma.childParentRelation.create({
      data: {
        childId: user.id,
        parentId: parentId,
        relationType: 'parent',
        permissions: {},
      },
    });

    // 创建监护设置
    await this.prisma.guardianSetting.create({
      data: {
        childId: user.id,
        parentId: parentId,
        dailyTimeLimit: 120,
        allowedTimeSlots: [],
        contentFilterLevel: 'standard',
        socialPermissions: {},
        notificationSettings: {},
      },
    });

    // 初始化能力画像
    const domains = ['ai', 'english', 'history', 'logic', 'science'];
    for (const domain of domains) {
      await this.prisma.abilityProfile.create({
        data: {
          childId: user.id,
          domain,
          score: 0,
          level: 1,
        },
      });
    }

    // 初始化等级
    const level1 = await this.prisma.level.findFirst({ where: { sequence: 1 } });
    if (level1) {
      await this.prisma.userLevel.create({
        data: {
          userId: user.id,
          levelId: level1.id,
          currentPoints: 0,
        },
      });
    }

    return {
      childId: user.id,
      nickname: child.nickname,
      ageGroup: child.ageGroup,
      message: '儿童账号创建成功',
    };
  }

  // ==================== 家长登录 ====================

  async loginParent(dto: ParentLoginDto): Promise<LoginResponseDto> {
    // 查找家长
    const parent = await this.prisma.parent.findFirst({
      where: {
        OR: [{ phone: dto.identifier }, { email: dto.identifier }],
      },
      include: { user: true },
    });

    if (!parent) {
      throw new UnauthorizedException('账号不存在');
    }

    // 检查登录尝试次数
    const attempts = await this.redis.getLoginAttempts(parent.userId);
    if (attempts >= 5) {
      throw new UnauthorizedException('登录尝试次数过多，请15分钟后重试');
    }

    // 验证密码
    const credential = await this.prisma.userCredential.findFirst({
      where: { userId: parent.userId, credentialType: 'password' },
    });

    if (!credential || !credential.credentialHash) {
      throw new UnauthorizedException('密码凭证不存在');
    }

    const isMatch = await bcrypt.compare(dto.password, credential.credentialHash);
    if (!isMatch) {
      await this.redis.incrementLoginAttempts(parent.userId);
      throw new UnauthorizedException('密码错误');
    }

    // 清除登录尝试记录
    await this.redis.clearLoginAttempts(parent.userId);

    // 生成Token
    const tokens = await this.generateTokens(parent.userId, 'parent');

    // 记录登录状态
    await this.redis.setUserLogin(parent.userId, {
      lastActivity: new Date().toISOString(),
      deviceId: dto.deviceId,
    });

    return {
      userId: parent.userId,
      userType: 'parent',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      profile: {
        id: parent.userId,
        phone: parent.phone,
        email: parent.email,
        name: parent.name,
      },
    };
  }

  // ==================== 儿童登录 ====================

  async loginChild(dto: ChildLoginDto): Promise<LoginResponseDto> {
    // 查找儿童
    const child = await this.prisma.child.findUnique({
      where: { userId: dto.childId },
      include: { user: true },
    });

    if (!child) {
      throw new UnauthorizedException('儿童账号不存在');
    }

    // 检查登录尝试次数
    const attempts = await this.redis.getLoginAttempts(dto.childId);
    if (attempts >= 5) {
      throw new UnauthorizedException('登录尝试次数过多，请15分钟后重试');
    }

    // 根据凭证类型验证
    const credential = await this.prisma.userCredential.findFirst({
      where: {
        userId: dto.childId,
        credentialType: dto.credentialType,
      },
    });

    if (!credential) {
      throw new UnauthorizedException('凭证不存在');
    }

    let isValid = false;

    switch (dto.credentialType) {
      case 'password':
        isValid = await bcrypt.compare(dto.credential, credential.credentialHash || '');
        break;
      case 'pattern':
        // 图形密码验证（简单字符串匹配）
        isValid = dto.credential === credential.credentialHash;
        break;
      default:
        throw new BadRequestException('不支持的凭证类型');
    }

    if (!isValid) {
      await this.redis.incrementLoginAttempts(dto.childId);
      throw new UnauthorizedException('凭证错误');
    }

    // 清除登录尝试记录
    await this.redis.clearLoginAttempts(dto.childId);

    // 生成Token
    const accessTokenExpiresIn = child.ageGroup === '4-6' ? '2h' : '4h';
    const tokens = await this.generateTokens(dto.childId, 'child', accessTokenExpiresIn);

    // 记录登录状态
    await this.redis.setUserLogin(dto.childId, {
      lastActivity: new Date().toISOString(),
      deviceId: dto.deviceId,
    });

    // 创建会话
    const sessionId = this.generateSessionId();
    await this.redis.setSession(sessionId, {
      userId: dto.childId,
      userType: 'child',
      ageGroup: child.ageGroup,
    });

    return {
      userId: dto.childId,
      userType: 'child',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      sessionId,
      profile: {
        id: dto.childId,
        nickname: child.nickname,
        ageGroup: child.ageGroup,
        avatarId: child.avatarId,
      },
      ageGroupConfig: this.getAgeGroupConfig(child.ageGroup),
    };
  }

  // ==================== 刷新Token ====================

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET') || 'futurestar-refresh-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const accessToken = this.jwtService.sign({
        sub: user.id,
        type: user.userType,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Refresh Token无效或已过期');
    }
  }

  // ==================== 辅助方法 ====================

  private async generateTokens(userId: string, userType: string, accessExpiresIn?: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.jwtService.sign(
      { sub: userId, type: userType },
      { expiresIn: accessExpiresIn || '4h' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, type: userType },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET') || 'futurestar-refresh-secret',
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }

  private calculateAgeGroup(birthDate: string): string {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    if (age >= 4 && age <= 6) return AgeGroup.YOUNG;
    if (age >= 7 && age <= 9) return AgeGroup.MIDDLE;
    if (age >= 10 && age <= 12) return AgeGroup.OLDER;

    // 默认根据年龄返回最近的分组
    if (age < 4) return AgeGroup.YOUNG;
    return AgeGroup.OLDER;
  }

  private getAgeGroupConfig(ageGroup: string): object {
    const configs = {
      '4-6': {
        maxContentLength: 200,
        interactionStyle: 'voice',
        navigationStyle: 'large-icon',
        animationLevel: 'high',
        feedbackStyle: 'emoji',
        features: ['video', 'interaction'],
      },
      '7-9': {
        maxContentLength: 300,
        interactionStyle: 'text-voice',
        navigationStyle: 'icon-text',
        animationLevel: 'medium',
        feedbackStyle: 'emoji-text',
        features: ['video', 'interaction', 'quiz', 'note', 'comment'],
      },
      '10-12': {
        maxContentLength: 500,
        interactionStyle: 'text',
        navigationStyle: 'full',
        animationLevel: 'low',
        feedbackStyle: 'text',
        features: ['video', 'interaction', 'quiz', 'note', 'comment', 'blog', 'group'],
      },
    };
    return configs[ageGroup] || configs['7-9'];
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== 设置儿童密码 ====================

  async setChildPassword(childId: string, password: string, parentId: string): Promise<void> {
    // 验证家长权限
    const relation = await this.prisma.childParentRelation.findFirst({
      where: { childId, parentId },
    });

    if (!relation) {
      throw new UnauthorizedException('无权限为此儿童设置密码');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.userCredential.upsert({
      where: {
        userId_credentialType: { userId: childId, credentialType: 'password' },
      },
      create: {
        userId: childId,
        credentialType: 'password',
        credentialHash: hashedPassword,
        isPrimary: true,
      },
      update: {
        credentialHash: hashedPassword,
      },
    });
  }

  // ==================== 设置图形密码 ====================

  async setChildPatternPassword(childId: string, pattern: string, parentId: string): Promise<void> {
    // 验证家长权限
    const relation = await this.prisma.childParentRelation.findFirst({
      where: { childId, parentId },
    });

    if (!relation) {
      throw new UnauthorizedException('无权限为此儿童设置密码');
    }

    await this.prisma.userCredential.upsert({
      where: {
        userId_credentialType: { userId: childId, credentialType: 'pattern' },
      },
      create: {
        userId: childId,
        credentialType: 'pattern',
        credentialHash: pattern,
        isPrimary: false,
      },
      update: {
        credentialHash: pattern,
      },
    });
  }
}