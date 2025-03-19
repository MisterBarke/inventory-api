import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [DeliveryService],
  controllers: [DeliveryController],
  exports:[DeliveryService],
  imports:[PrismaModule]
})
export class DeliveryModule {}
