import { Inject, Injectable, Logger } from '@nestjs/common';
import { PubSub, Subscription } from '@google-cloud/pubsub';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PubSubAsyncConsumeService {
  private logger = new Logger(PubSubAsyncConsumeService.name);
  private subscriberOptions = {
    flowControl: {
      maxMessages: 10,
    },
  };
  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject('PUB_SUB_CLIENT') private readonly pubSubClient: PubSub,
    private readonly config: ConfigService,
  ) {
    this.initPubSubPocTopicConsume();
  }

  protected initPubSubPocTopicConsume(): void {
    const subscriptionName = `${this.config.get(
      'PUB_SUB_TOPICS',
    )}-subscription`;

    // References an existing subscription.
    // Note that flow control settings are not persistent across subscribers.
    const subscription = this.pubSubClient.subscription(
      subscriptionName,
      this.subscriberOptions,
    );

    this.logger.log(
      `Subscriber to subscription ${
        subscription.name
      } is ready to receive messages at a controlled volume of ${10} messages.`,
    );

    const messageHandler = (message) => {
      this.logger.log(`Received message: ${message.id}`);
      this.logger.log(`\tData: ${message.data}`);
      this.logger.log(`\tAttributes: ${message.attributes}`);
      // Call some process here.
      // "Ack" (acknowledge receipt of) the message
      message.ack();
    };

    subscription.on('message', messageHandler);
    subscription.on('error', (e) => {
      // Do something with error here.
      this.logger.error(`Have error ${e?.message()}`);
    });

    this.subscriptions.push(subscription);
  }

  public onApplicationShutdown(signal: string) {
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach((sub: Subscription) => sub.close());
    }
  }
}
