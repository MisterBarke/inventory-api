import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
      ) {
    
      }
      async findOne(id: string) {
        return await this.prisma.users.findUnique({
          where: { id },
        });
      }
}
