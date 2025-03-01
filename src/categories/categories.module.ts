import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports:[PrismaModule],
  exports:[CategoriesService]
})
export class CategoriesModule {}
