import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ItemsService } from './items.service';

@Module({
    controllers: [ItemsController],
    providers: [ItemsService],
    exports:[ItemsService],
    imports:[PrismaModule]
})
export class ItemsModule {
 
}
