import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';



@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports:[ConfigModule.forRoot(),  // 👈 Assurez-vous que le module Config est bien chargé
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),  // 👈 Vérifiez que cette ligne est correcte
        signOptions: { expiresIn: '1h' },
      }),
    }),
    PrismaModule, JwtModule, JwtStrategy]
  
})
export class AuthModule {}
