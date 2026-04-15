import { Injectable, ExecutionContext } from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // 允许未认证用户访问，但会尝试解析token
    return super.canActivate(context) as boolean;
  }

  handleRequest(err: any, user: any) {
    // 即使认证失败也继续
    if (err || !user) {
      return null;
    }
    return user;
  }
}