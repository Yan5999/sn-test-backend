import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RedisStore } from 'connect-redis';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { createClient } from 'redis';

import { AppModule } from './app.module';
import ms, { StringValue } from './libs/common/utils/ms.util';
import { parseBoolean } from './libs/common/utils/parse-boolean.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGINS').split(','),
    credentials: true,
    methods: 'GET, POST, DELETE, PATCH',
    exposedHeaders: ['set-cookie'],
  });

  const redisClient = createClient({
    url: config.getOrThrow<string>('REDIS_URI'),
  });
  await redisClient.connect();

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')));

  const sessionMaxAgeMs = ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE'));

  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
        prefix: config.getOrThrow<string>('SESSION_FOLDER'),
      }),
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: sessionMaxAgeMs,
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: 'lax',
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('sn-test API')
    .setDescription('Social Network API documentation')
    .setVersion('1.0.0')
    .setContact('Yan', 'https://github.com/Yan5999', 'koropyan5999@gmail.com')
    .addCookieAuth(config.getOrThrow<string>('SESSION_NAME'))
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(config.getOrThrow<number>('APPLICATION_PORT'));
}
bootstrap();
