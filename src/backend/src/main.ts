import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as passport from 'passport';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // API前缀
  app.setGlobalPrefix('api/v1');

  // Swagger API文档
  const config = new DocumentBuilder()
    .setTitle('未来星学堂 API')
    .setDescription('少儿素质教育平台API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Session配置（用于儿童简单认证）
  const configService = app.get(ConfigService);
  app.use(
    session({
      secret: configService.get('SESSION_SECRET') || 'futurestar-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1小时
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 FutureStar Academy API running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();