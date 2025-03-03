import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import helmet from 'helmet';

import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { validationError } from './filters/validation.errors';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  await app.init();

  app.setGlobalPrefix('api/v1');
  //setupSwagger(app);
  const config = new DocumentBuilder()
  .setTitle('API de gestion de stock')
  .setDescription('API description')
  .setVersion('1.0')
  .build();
  
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);


  const configService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      always: true,
      exceptionFactory: (errors: ValidationError[]) => {
        return validationError(errors);
      },
    }),
  );

  console.log(`🚀 Server running on port ${configService.get<number>('port', 8000)}`);
  await app.listen(configService.get<number>('port', 8000));
  
}
bootstrap();
