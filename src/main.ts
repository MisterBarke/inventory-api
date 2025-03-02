import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import { setupSwagger } from './swagger';
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
  .setTitle('API de gestion du stock')
  .setDescription('Documentation de l’API pour gérer le stock')
  .setVersion('1.0')
  .addBearerAuth() // Si tu utilises l'authentification JWT
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);

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
