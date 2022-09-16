import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PubSub } from '@google-cloud/pubsub';
import { PubSubConfigUtil } from '../utils/pub-sub.config.util';

export const pubSubClientProvider: Provider = {
  provide: 'PUB_SUB_CLIENT',
  useFactory: (config: ConfigService) => {
    console.log('init pub sub client');
    return new PubSub(PubSubConfigUtil(config));
  },
  inject: [ConfigService],
};
