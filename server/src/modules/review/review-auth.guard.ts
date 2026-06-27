import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';

/** Single shared-token guard for the editorial review API -- no user accounts yet (P2a scope). */
@Injectable()
export class ReviewAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const expected = process.env.REVIEWER_TOKEN;
    if (!expected) {
      throw new UnauthorizedException('REVIEWER_TOKEN is not configured on the server');
    }
    const header = request.headers.authorization;
    if (header !== `Bearer ${expected}`) {
      throw new UnauthorizedException('Invalid reviewer token');
    }
    return true;
  }
}
