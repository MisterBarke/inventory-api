import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';   
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ){

    }

    async register (dto: RegisterDto, role: Role = Role.ADMIN){
      console.log('DTO reçu:', dto);
        const retreiveUser = await this.prisma.users.findUnique({
            where: {
              email: dto.email
            },
          });
          if (retreiveUser) throw new HttpException('User already exist', 409);
          const saltOrRounds = 10;
          const hashedPassword = await bcrypt.hash(dto.password, saltOrRounds);
        const newUser = await this.prisma.users.create({
            data: {
              email: dto.email,
              password: hashedPassword,
              name: dto.name,
              role
            }
        })
        return newUser
    }

    async signJwt(userId: string, payload) {
        const data = {
          access_token: this.jwtService.sign(payload, { expiresIn: '1d' }),
          refresh_token: this.jwtService.sign({ userId }, { expiresIn: '1d' }),
        };
        const r = this.jwtService.decode(data.access_token);
        await this.prisma.users.update({
          where: {
            id: userId,
          },
          data: {
            refresh_token: data.refresh_token,
          },
        });
        return { ...data, ...r };
      }

      async validateUser(email: string, password: string) {
        const user = await this.prisma.users.findFirst({
          where: {
            email,
          },
        });
        if (user) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch) {
            const { password, ...result } = user;
            return result;
          }
        }
        return null;
      }

      async login({ email, password }: LoginDto) {
        const informationUser = await this.validateUser(email, password);
        if (!informationUser) throw new UnauthorizedException();
        const tokens = await this.signJwt(informationUser.id, informationUser);
        return {
          ...tokens,
          user: informationUser,
        };
      }

      async updatePassword(id: string, password : string) {
        const user = await this.prisma.users.findUnique({
          where: {
            id,
          },
        });
        if (!user) throw new UnauthorizedException();
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds);
        await this.prisma.users.update({
          where: {
            id,
          },
          data: {
            password: hash,
          },
        });
      }
}
