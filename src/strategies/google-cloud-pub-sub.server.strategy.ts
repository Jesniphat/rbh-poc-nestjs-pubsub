import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { Message, PubSub, Subscription } from '@google-cloud/pubsub';
import { Logger } from '@nestjs/common';
import { TopicMapping } from '../commons/models/PubSubServerOptions';
import { isError } from 'lodash';
import { ConfigService } from '@nestjs/config';
import { PubSubConfigUtil } from '../commons/utils/pub-sub.config.util';

type MessageHandler = (message: Message) => Promise<void>;

export class GoogleCloudPubSubServer
  extends Server
  implements CustomTransportStrategy
{
  public logger = new Logger(GoogleCloudPubSubServer.name);
  private pubSubClient: PubSub;
  private topics: TopicMapping;
  private readonly subscriptions: { [topicId: string]: Subscription } = {};

  constructor(private config: ConfigService) {
    super();
  }

  close(): any {
    Object.values(this.subscriptions).forEach((sub) => {
      sub.close().catch((e) => this.handleError(e));
    });
  }

  public async listen(
    callback: (...optionalParams: unknown[]) => void,
  ): Promise<void> {
    await this.initPubSub();

    const topicLists: string[] = [this.config.get('PUB_SUB_TOPICS')];
    for (let i = 0; i < topicLists.length; i++) {
      this.topics = {
        [topicLists[i]]: { subscriptionId: `${[topicLists[i]]}-subscription` },
      };
    }
    const registeredPatterns = [...this.messageHandlers.keys()];

    const subscribeAll = registeredPatterns.map((topicId: string) =>
      this.initSubscription(topicId, this.topics[topicId].subscriptionId),
    );

    Promise.all(subscribeAll)
      .then(() => callback())
      .catch((e) => {
        this.logger.error(`Start asynchronous subscription error ${e.message}`);
      });
  }

  private async initSubscription(
    topicId: string,
    subscribeName: string,
  ): Promise<void> {
    try {
      const subOptions = this.topics[topicId];
      if (!subOptions) {
        this.logger.error(`No subscription ID defined for topic ${topicId}`);
        return;
      }

      const subscription = this.pubSubClient.subscription(subscribeName, {
        flowControl: {
          maxMessages: 10,
        },
      });

      const messageHandler: MessageHandler = async (message: Message) => {
        console.log(`\tReceived asynchronous message ${message.id}: in server`);
        const handler = this.messageHandlers.get(topicId);
        if (!handler) {
          this.logger.warn(`No handler for message ${message.id}`);
          message.ack();
          return;
        }
        message.ack();
        await handler(message);
      };

      subscription.on('message', await messageHandler);
      subscription.on('error', (e) => this.handleError(e));

      this.subscriptions[topicId] = subscription;
    } catch (e) {
      this.logger.error(
        `Error to init asynchronous subscription topic ${topicId} and subscription ${subscribeName} error is ${e.message}`,
      );
    }
  }

  private async initPubSub(): Promise<void> {
    try {
      this.pubSubClient = new PubSub(PubSubConfigUtil(this.config));
      this.logger.log(`Init Asynchronous Pub Sub success.`);
    } catch (e) {
      this.logger.error(`Init Asynchronous Pub Sub error ${e.message}`);
    }
  }

  protected handleError(error: any) {
    if (isError(error)) {
      super.handleError(error.stack || error.toString());
    } else {
      super.handleError(error);
    }
  }
}
