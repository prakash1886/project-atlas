import { Module } from '@nestjs/common';
import { EnvatoService } from './envato.service.js';

@Module({
  providers: [EnvatoService],
  exports: [EnvatoService],
})
export class EnvatoModule {}
