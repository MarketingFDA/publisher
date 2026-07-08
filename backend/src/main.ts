import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

process.on('uncaughtException', (e: unknown) => {
  process.stderr.write(
    '[FATAL] uncaughtException: ' + ((e as Error)?.stack || String(e)) + '\n',
  );
});
process.on('unhandledRejection', (e: unknown) => {
  process.stderr.write(
    '[FATAL] unhandledRejection: ' + ((e as Error)?.stack || String(e)) + '\n',
  );
});

async function bootstrap() {
  process.stdout.write('[BOOT] iniciando bootstrap do Nest\n');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: true });
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  process.stdout.write(`[BOOT] Backend rodando em 0.0.0.0:${port}/api/v1\n`);
}

bootstrap().catch((err: unknown) => {
  process.stderr.write(
    '[FATAL] bootstrap falhou: ' + ((err as Error)?.stack || String(err)) + '\n',
  );
  process.exitCode = 1;
});
