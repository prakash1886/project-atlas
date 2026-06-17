import '../otel.js';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { join } from 'node:path';
import fastifyStatic from '@fastify/static';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  await app.register(fastifyStatic, {
    root: join(process.cwd(), 'dist'),
    prefix: '/',
    wildcard: false,
  });

  const httpAdapter = app.getHttpAdapter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  httpAdapter.get('/*', (req: { url?: string }, res: any) => {
    const url = req.url;
    if (url && url.startsWith('/api')) {
      res.status(404).send({ statusCode: 404, message: `Cannot GET ${url}`, error: 'Not Found' });
    } else {
      res.sendFile('index.html');
    }
  });

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT, '0.0.0.0');
  console.log(`[Project Atlas] Monolith running on http://localhost:${PORT}`);
}

bootstrap();
