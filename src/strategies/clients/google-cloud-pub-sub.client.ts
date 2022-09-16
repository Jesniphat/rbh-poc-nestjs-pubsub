import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { PubSub } from '@google-cloud/pubsub';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { PubSubConfigUtil } from '../../commons/utils/pub-sub.config.util';

export class GoogleCloudPubSubClient extends ClientProxy {
  public logger = new Logger(GoogleCloudPubSubClient.name);
  private pubSubClient: PubSub;

  constructor(private readonly config: ConfigService) {
    super();
  }

  async connect(): Promise<void> {
    this.pubSubClient = new PubSub(PubSubConfigUtil(this.config));
  }

  async close(): Promise<void> {
    this.logger.log('Close pub sub client.');
  }

  async dispatchEvent(packet: ReadPacket<any>): Promise<any> {
    const dataBuffer = Buffer.from(packet.data);
    try {
      const messageId = await this.pubSubClient
        .topic(packet.pattern)
        .publishMessage({ data: dataBuffer });
      console.log(`Message ${messageId} published.`);
      return messageId;
    } catch (error) {
      console.error(`Received error while publishing: ${error.message}`);
      process.exitCode = 1;
    }
  }

  publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ): () => void {
    console.log('message:', packet);

    // In a real-world application, the "callback" function should be executed
    // with payload sent back from the responder. Here, we'll simply simulate (5 seconds delay)
    // that response came through by passing the same "data" as we've originally passed in.
    setTimeout(() => callback({ response: packet.data }), 2000);

    return () => console.log('teardown');
  }
}
