import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    controllers: [ItemsController],
    providers: [ItemsController],
    imports:[PrismaModule]
})
export class ItemsModule {
 
}
