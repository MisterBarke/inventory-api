import { HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';   
import { JwtService } from '@nestjs/jwt';
import { CreateCompanyDto, LoginDto, RegisterDto } from './dto/create-user.dto';
import { Role } from '@prisma/client';


@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ){

    }

    private isValidPassword(password: string): boolean {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
      return regex.test(password);
    }

    async register (dto: RegisterDto, role: Role = Role.ADMIN, companyId: string){
      
      if (!this.isValidPassword(dto.password)) {
        throw new HttpException('Le mot de passe doit contenir exactement 6 caractères alphanumériques avec au moins une majuscule, une minuscule et un chiffre.', 409);
      };

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
              role,
              company: {connect: {id: companyId}}
            }
        })
        return newUser
    }

    async createCompany(dto: CreateCompanyDto){
      let company = await this.prisma.company.findUnique({
        where:{
          name: dto.name
        }
      });
      if(company) throw new HttpException('Company already exist', 409);
      if(!company){
        company = await this.prisma.company.create({
          data: {
            name: dto.name,
          },
        });
      }
      return company;
    }

    async getCompanies(){
      return await this.prisma.company.findMany({include:{users:true}})
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

        if (!this.isValidPassword(password)) {
          throw new HttpException('Le mot de passe doit contenir exactement 6 caractères alphanumériques avec au moins une majuscule, une minuscule et un chiffre.', 409);
        };

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
