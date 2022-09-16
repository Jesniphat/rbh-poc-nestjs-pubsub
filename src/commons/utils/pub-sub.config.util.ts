import { ConfigService } from '@nestjs/config';
import { PRIVATE_KEY } from '../constants/constant.config';

export const PubSubConfigUtil = (config: ConfigService) => {
  return {
    projectId: config.get('GOOGLE_PROJECT_ID'),
    credentials: {
      client_email: config.get('CLIENT_EMAIL'),
      private_key: PRIVATE_KEY,
      client_id: config.get('CLIENT_ID'),
      token_url: config.get('TOKEN_URL'),
    },
  };
}
