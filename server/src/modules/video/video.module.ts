import { Module } from '@nestjs/common';
import { VideoRenderService } from './video-render.service.js';
import { HeyGenService } from './heygen.service.js';
import { HiggsfieldService } from './higgsfield.service.js';
import { GoogleVeoService } from './google-veo.service.js';
import { GoogleLyriaService } from './google-lyria.service.js';
import { VideoController } from './video.controller.js';

@Module({
  controllers: [VideoController],
  providers: [VideoRenderService, HeyGenService, HiggsfieldService, GoogleVeoService, GoogleLyriaService],
  exports: [VideoRenderService, HeyGenService, HiggsfieldService, GoogleVeoService, GoogleLyriaService],
})
export class VideoModule {}

