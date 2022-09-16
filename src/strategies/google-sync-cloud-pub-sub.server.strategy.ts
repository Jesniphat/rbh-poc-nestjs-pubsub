import { v1 } from '@google-cloud/pubsub';
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { PubSubServerOptions } from '../commons/models/PubSubServerOptions';

export class GoogleSyncCloudPubSubServerStrategy
  extends Server
  implements CustomTransportStrategy
{
  public logger = new Logger(GoogleSyncCloudPubSubServerStrategy.name);
  private subClient;

  constructor(private readonly options: PubSubServerOptions) {
    super();
  }

  close(): any {
    // Object.values(this.subscriptions).forEach((sub) => {
    //   sub.close().catch((e) => this.handleError(e));
    // });
    this.logger.log('Closed sync pubsub.');
  }

  public async listen(
    callback: (...optionalParams: unknown[]) => void,
  ): Promise<void> {
    await this.initPubSub();
    setInterval(() => {
      const registeredPatterns = [...this.messageHandlers.keys()];

      const subscribeAll = registeredPatterns.map((topicId: string) =>
        this.initSubscription(
          topicId,
          this.options.topics[topicId].subscriptionId,
        ),
      );

      Promise.all(subscribeAll)
        .then(() => callback())
        .catch((e) => {
          this.logger.error(`Start subscription error ${e.message}`);
        });
    }, 1000);
  }

  private async initSubscription(
    topicId: string,
    subscribeName: string,
  ): Promise<void> {
    try {
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
        console.log(`Received message: ${message.message.data}`);
        messages.push(message.message);
        ackIds.push(message.ackId);
      }

      if (ackIds.length !== 0) {
        // Acknowledge all of the messages. You could also acknowledge
        // these individually, but this is more efficient.
        const ackRequest = {
          subscription: formattedSubscription,
          ackIds: ackIds,
        };

        const handler = this.messageHandlers.get(topicId);
        await handler(messages);
        await this.subClient.acknowledge(ackRequest);
      }

      this.logger.log('Done.');
    } catch (e) {
      this.logger.error(
        `Error to init subscription topic ${topicId} and subscription ${subscribeName} error is ${e.message}`,
      );
    }
  }

  private async initPubSub(): Promise<void> {
    try {
      this.subClient = new v1.SubscriberClient({
        projectId: 'grand-lamp-268404',
        credentials: {
          client_email: 'poc-pubsup@grand-lamp-268404.iam.gserviceaccount.com',
          private_key: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC1Jt/QCvfhTB5c\nJHUn7Df+LMlJbf360oc2tR27WMb//S8Ek+bCVItdXXZnPJL2ctivfs53NP7GwUwr\niiFJmOPcKRYvlrq5HGuqCbiQStzZbjXYTnjdvYz6qI+52Il1m/JrSLtdxnoi5X7y\n9URHFog19YqtH0kYK9MVw2b2nxgmElwlSDDXDhAUCUb4ZhDlt/A/KJEgMin5L/Hg\nexk9DWmHh1a1XUIOSCRYuUoi6fR7VsZmpn7qes4cULbum6n4k6qTyXm6iqXEMkg5\nEdtbJESaNuZk7hQv1DqloeH3sHeKyZdLuzq0Qv1cpOsOAuJdWpxxnGO9qrAZLHm5\nZhlzuwlhAgMBAAECggEAAU/TF9EzhDVD5HfAXpbHcHlG+oejET4ouK7PmwuLzEV+\ngehkOvcnvig0i+9dRe77gBi+MnCe6wxe0qAktdeEFQEG0JciDYzKoA12pMdamyTt\n24RIDzZQ00bo4wmoR0XW99VL3Sdx1OdWH78cUWdrR58Ng/iA3Z2huo1hO6l+M3zd\nv3b2w/JvKEm5M7Sg5RH9qflemkycus++rr6RY/ohF3hsLQ/PfrH4GFGWR7jcxqpx\nxkqyUrQsGzybTSM+2b+SywckSbziSkiAAgg1EST1pzVex0ms3terG0RAR0w+eqHt\nk9xHhhTMYViD3Q8tJcPFEp+H/oFP4wo/q9uI5w4VsQKBgQDmYiCbUe0QlJFod+WJ\nbJrk6XIgjOkfqqeGDWfahJXHZjwHrC2VRF23jyRI7U++3CiU4/GzYEh3JZCGSlR3\n7pXt/Pei/ei5iEFbLCFsBOg5UK5IIuQL2CyK4e6oUONMz/wUX29g9vVN4bN6TNcc\nQEUXhLFOLwnQdTCfLk2veTxsMQKBgQDJS173P+GwQKS07lnksQnSlkGDfe/Fgv+A\nGwhwFijvmNrQxGCkwU3yGpd+Tvc2ZT4txOGScv9dvEOoqHXVlGmcaYs9rNYD575c\nS2N6tfycMQnO/yEfMoP4l/ur35ptVwb7EFo8B13m9ltzbM4ZxLEBgCZSrG88+Mtj\nRm5ieP6UMQKBgQCAwWi9xYy7TnzxqMh1BGiQ9NMe1AHZ+9NCfS2El8LpvP5hv11+\nZcYGt44s38xIu9xGUhqcCHyXcjwSgWox2PqcFlwEEOnG/xqfrMtFBn0Ow0OT90QC\nRp+mQtzR3tsZ68dTT3787yhrjW90M4upM1Yp7bP2IR3YDhbNb+Bk6FnXkQKBgQCw\nqhOo0EoVVEa5/M6sZayHRBQvgWHkaPowxoj7Rpea4P56Zz+imXz9VNVMp6VT+js+\nFCMdUwxIiiifZ2ozjtO50O/Bq2URfFyXyBqA4iPYOTmwkD3TkZQ9o7XfvJleCRk5\nU7q+IIELaYANp5qjBvuKo5v+xxPB4WEvueq7RhG4oQKBgEofAoHV18b9jc4HDuvy\n9Uzl1/hBBbXfNfGmZaSI8I9qu7VkRZdQG3AiMm/4WO2plrHjTEfIALfL6eelyncR\n1jNjqNbjW1pdCmzDnkkwR0LoY58BxGL1tVQVYYm36QwLNZnPfORflbqEpLHWHJpI\n4KjRtKs+wXi3lyviKOGzi09K\n-----END PRIVATE KEY-----\n`,
          client_id: '106135778617387174740',
          token_url: 'https://oauth2.googleapis.com/token',
        },
      });
      this.logger.log(`Init Pub Sub success.`);
    } catch (e) {
      this.logger.error(`Init Pub Sub error ${e.message}`);
    }
  }
}
