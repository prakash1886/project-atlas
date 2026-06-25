import { Module } from '@nestjs/common';
import { SearchService } from './search.service.js';
import { OpenSourceSearchService } from './open-source-search.service.js';

@Module({
  providers: [SearchService, OpenSourceSearchService],
  exports: [SearchService, OpenSourceSearchService],
})
export class SearchModule {}
