import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import { setupSwagger } from './swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { validationError } from './filters/validation.errors';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';


dotenv.config();
const server = express();
export default server;


async function bootstrap() {

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.use(helmet());
  app.enableCors();
  await app.init();

  // Expose NestJS en tant que handler pour Vercel

  app.setGlobalPrefix('api/v1');
  setupSwagger(app);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      always: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return validationError(errors);
      },
    }),
  );

  console.log(`🚀 Server running on port ${configService.get<number>('port', 5000)}`);
  await app.listen(configService.get<number>('port', 5000));
  
}
bootstrap();
