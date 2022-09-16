import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleCloudPubSubClient } from '../../strategies/clients/google-cloud-pub-sub.client';

export const PubSubProxyProvider: Provider = {
  provide: 'PUB_SUB_PROXY',
  useFactory: (config: ConfigService) => {
    return new GoogleCloudPubSubClient(config);
  },
  inject: [ConfigService],
};
