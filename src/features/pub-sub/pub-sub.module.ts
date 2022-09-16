import { Module } from '@nestjs/common';
import { PubSubController } from './controllers/pub-sub.controller';
import { PubSubSyncConsumeService } from './services/pub-sub-sync-consume.service';
import { PubSubPublishService } from './services/pub-sub-publish.service';
import { PubSubAsyncConsumeService } from './services/pub-sub-async-consume.service';
import { pubSubClientProvider } from '../../commons/providers/pub-sub-client.provider';
import { PubSubProxyProvider } from '../../commons/providers/pub-sub-proxy.provider';

@Module({
  controllers: [PubSubController],
  providers: [
    PubSubProxyProvider,
    pubSubClientProvider,
    PubSubPublishService,
    PubSubAsyncConsumeService,
    PubSubSyncConsumeService,
  ],
})
export class PubSubModule {}
