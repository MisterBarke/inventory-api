import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ItemsService } from './items/items.service';
import { ItemsController } from './items/items.controller';
import { ItemsModule } from './items/items.module';
import { CategoriesController } from './categories/categories.controller';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return [
          {
            ttl: configService.get<number>('ratelimit.ttl', 10000),
            limit: configService.get<number>('ratelimit.limit', 50),
          },
        ];
      },
      inject: [ConfigService],
    }),
    CategoriesModule,
    ItemsModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_GUARD, 
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    ItemsService,
  ],
})
export class AppModule {}
