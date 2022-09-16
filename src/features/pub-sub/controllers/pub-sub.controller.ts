import { Controller, Logger, Put } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TOPIC_POC_PUB_SUB } from '../../../commons/constants/constant.config';
import { Message } from '@google-cloud/pubsub';
import { PubSubPublishService } from '../services/pub-sub-publish.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class PubSubController {
  private logger = new Logger(PubSubController.name);

  constructor(
    private readonly config: ConfigService,
    private pubSubPublish: PubSubPublishService,
  ) {}

  @MessagePattern(TOPIC_POC_PUB_SUB)
  public async pocPubSub(message: Message): Promise<void> {
    try {
      console.log(
        `\tReceived asynchronous message ${message.id}: in controller.`,
      );
      console.log(`\tData: ${message.data}`);
      console.log(`\tAttributes: ${JSON.stringify(message.attributes)}`);
      console.log(`\tWhen: ${message.publishTime}`);
    } catch (e) {
      this.logger.error(`${e?.error}`);
    }
  }

  @Put('send-message-proxy')
  public async sendMessageToQueue(): Promise<any> {
    return await this.pubSubPublish.sendMessageByProxy('My test.');
  }

  @Put('send-message')
  public async publishMessage(): Promise<string[]> {
    const messageIds = [];
    for (let i = 0; i < 20; i++) {
      const message = `Hello ${i + 1}`;
      const messageId = await this.pubSubPublish.sendPublishMessage(message);
      messageIds.push(messageId);
    }
    return messageIds;
  }
}
