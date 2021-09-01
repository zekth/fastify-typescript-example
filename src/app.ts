import fastify from 'fastify';
import { readFile } from 'fs';
import { join } from 'path';

import type { FastifyReply, FastifyRequest } from 'fastify';

const app = fastify({ logger: true });

app.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done) => {
  request.foo = 'bar';
  done();
});

app.get('/health', (request: FastifyRequest, reply: FastifyReply): void => {
  reply.send('ok');
});

app.get('/hello', (request: FastifyRequest, reply: FastifyReply): void => {
  reply.send('Hello');
});

app.get('/hellofile', (request: FastifyRequest, reply: FastifyReply): void => {
  readFile(join(__dirname, 'assets', 'hello.txt'), (err: NodeJS.ErrnoException | null, data: Buffer) => {
    if (err) {
      request.log.fatal(err);
      return reply.status(500).send('Unexpected server error');
    }
    return reply.header('content-type', 'plain/text').send(data);
  });
});

if (require.main === module) {
  app.listen(process.env.FASTIFY_LISTEN || 3000, '0.0.0.0', (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
}

export default app;

declare module 'fastify' {
  interface FastifyRequest {
    foo: string;
  }
}
