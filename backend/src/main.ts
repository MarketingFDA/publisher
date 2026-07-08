import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: true });
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Backend rodando em http://localhost:${process.env.PORT ?? 3001}/api/v1`);
}
bootstrap().catch((err) => {
  console.error('Falha no bootstrap do backend:', err);
  process.exit(1);
});
