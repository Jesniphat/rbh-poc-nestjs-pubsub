import { Inject, Injectable } from '@nestjs/common';
import { GoogleCloudPubSubClient } from '../../../strategies/clients/google-cloud-pub-sub.client';
import { ConfigService } from '@nestjs/config';
import { PubSub } from '@google-cloud/pubsub';

@Injectable()
export class PubSubPublishService {
  constructor(
    @Inject('PUB_SUB_CLIENT')
    private readonly pubSubClient: PubSub,
    @Inject('PUB_SUB_PROXY')
    private readonly googlePubSubClient: GoogleCloudPubSubClient,
    private readonly config: ConfigService,
  ) {}

  public async sendMessageByProxy(message: string): Promise<any> {
    return this.googlePubSubClient.emit(
      this.config.get('PUB_SUB_TOPICS'),
      message,
    );
  }

  public async sendPublishMessage(message: string): Promise<string> {
    const dataBuffer = Buffer.from(message);
    try {
      const messageId = await this.pubSubClient
        .topic(this.config.get('PUB_SUB_TOPICS'))
        .publishMessage({ data: dataBuffer });
      console.log(`Message ${messageId} published.`);
      return messageId;
    } catch (error) {
      console.error(`Received error while publishing: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
