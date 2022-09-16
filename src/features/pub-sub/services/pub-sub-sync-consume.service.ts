import { Injectable, Logger } from '@nestjs/common';
import { v1 } from '@google-cloud/pubsub';
import {
  CLIENT_EMAIL,
  CLIENT_ID,
  GOOGLE_PROJECT_ID,
  PRIVATE_KEY,
  TOKEN_URL,
} from '../../../commons/constants/constant.config';

@Injectable()
export class PubSubSyncConsumeService {
  private logger = new Logger(PubSubSyncConsumeService.name);
  private pubSubConnectionConfig = {
    projectId: GOOGLE_PROJECT_ID,
    credentials: {
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
      client_id: CLIENT_ID,
      token_url: TOKEN_URL,
    },
  };
  private subClient;

  constructor() {
    this.listen().catch((e) => this.logger.error(`${e?.message}`));
  }

  private async listen(): Promise<void> {
    await this.initSyncPubSub();
    // setInterval(() => this.initSyncSubsciption(), 5000);
    // await this.initSyncSubsciption();
  }

  private async initSyncSubsciption(): Promise<void> {
    const subscribeName = 'poc-pubsub01';
    const formattedSubscription =
      subscribeName.indexOf('/') >= 0
        ? subscribeName
        : this.subClient.subscriptionPath('grand-lamp-268404', subscribeName);

    const request = {
      subscription: formattedSubscription,
      maxMessages: 10,
    };

    // The subscriber pulls a specified number of messages.
    const [response] = await this.subClient.pull(request);

    // Process the messages.
    const messages: string[] = [];
    const ackIds = [];
    for (const message of response.receivedMessages) {
      console.log(`\n\tReceived synchronous message: ${message.message.data}`);
      messages.push(message.message);
      ackIds.push(message.ackId);
    }

    if (ackIds.length !== 0) {
      // Acknowledge messages. You could also acknowledge
      // these individually, but this is more efficient.
      const ackRequest = {
        subscription: formattedSubscription,
        ackIds: ackIds,
      };
      await this.subClient.acknowledge(ackRequest);
    }
    // console.log(messages);
    // this.logger.log('Done.');
  }

  private async initSyncPubSub(): Promise<void> {
    try {
      this.subClient = new v1.SubscriberClient(this.pubSubConnectionConfig);
      this.logger.log(`Init Synchronous Pub Sub success.`);
    } catch (e) {
      this.logger.error(`Init Synchronous Pub Sub error ${e.message}`);
      throw e;
    }
  }
}
