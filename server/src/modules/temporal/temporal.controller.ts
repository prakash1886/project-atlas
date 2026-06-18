import { Controller, Get, Inject, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';

interface TemporalClientWithConnection {
  connection?: {
    healthService: {
      check: (req: { service: string }) => Promise<{ status: string }>;
    };
  };
}

@Controller('api/temporal-health')
export class TemporalController {
  constructor(
    @Inject('TEMPORAL_CLIENT')
    private readonly client: TemporalClientWithConnection
  ) {}

  @Get()
  async getHealth(@Res() res: FastifyReply) {
    const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
    
    // Check if it's a stub/mock client (which does not have a connection object)
    if (!this.client.connection) {
      return res.status(503).send({
        status: 'disconnected',
        address,
        details: 'Running in offline/stub mode (connection failed or address not configured).',
      });
    }

    try {
      await this.client.connection.healthService.check({ service: '' });
      return res.status(200).send({
        status: 'connected',
        address,
        details: 'Successfully connected and verified cluster health.',
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      return res.status(502).send({
        status: 'error',
        address,
        details: errorMessage,
      });
    }
  }
}
