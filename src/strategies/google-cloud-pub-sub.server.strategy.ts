import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { Message, PubSub, Subscription, Topic } from '@google-cloud/pubsub';
import { Logger } from '@nestjs/common';

type MessageHandler = (message: Message) => Promise<void>;

class GoogleCloudPubSubServer
  extends Server
  implements CustomTransportStrategy
{
  public logger = new Logger(GoogleCloudPubSubServer.name);
  private pubSubClient: PubSub;
  private topic: Topic;
  private readonly subscriptions: { [topicId: string]: Subscription } = {};

  constructor(private readonly options: any) {
    super();

    this.pubSubClient = new PubSub({
      projectId: 'grand-lamp-268404',
    });
    this.topic = this.pubSubClient.topic('poc-pubsub');
  }

  close(): any {
    //
  }

  listen(callback: (...optionalParams: unknown[]) => void): void {
    const subscription = this.topic.subscription('poc-pubsub');
    console.log(this.messageHandlers.keys());
  }
}
