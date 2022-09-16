import { Module } from '@nestjs/common';
import { PubSubController } from './controllers/pub-sub.controller';
import { PubSubSyncConsumeService } from './services/pub-sub-sync-consume.service';
import { GoogleCloudPubSubClient } from '../../strategies/clients/google-cloud-pub-sub.client';
import { ConfigService } from '@nestjs/config';
import { PubSubPublishService } from './services/pub-sub-publish.service';
import { PubSub } from '@google-cloud/pubsub';
import { PubSubConfigUtil } from '../../commons/utils/pub-sub.config.util';
import { PubSubAsyncConsumeService } from './services/pub-sub-async-consume.service';

@Module({
  controllers: [PubSubController],
  providers: [
    {
      provide: 'PUB_SUB_PROXY',
      useFactory: (config: ConfigService) => {
        return new GoogleCloudPubSubClient(config);
      },
      inject: [ConfigService],
    },
    {
      provide: 'PUB_SUB_CLIENT',
      useFactory: (config: ConfigService) => {
        console.log('init pub sub client');
        return new PubSub(PubSubConfigUtil(config));
      },
      inject: [ConfigService],
    },
    PubSubPublishService,
    PubSubAsyncConsumeService,
    PubSubSyncConsumeService,
  ],
})
export class PubSubModule {}
