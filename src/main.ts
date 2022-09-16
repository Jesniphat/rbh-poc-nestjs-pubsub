import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GoogleCloudPubSubServer } from './strategies/google-cloud-pub-sub.server.strategy';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // app.connectMicroservice<MicroserviceOptions>({
  //   strategy: new GoogleCloudPubSubServer(configService),
  // });
  //
  // await app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();
