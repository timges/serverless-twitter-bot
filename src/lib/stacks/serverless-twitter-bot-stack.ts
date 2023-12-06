import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScheduledLambda } from '../components/scheduled-lambda';
import path = require('path');
import { Schedule } from 'aws-cdk-lib/aws-events';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class ServerlessTwitterBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { consumerKey, consumerKeySecret, accessKey, accessKeySecret, openaiApiKey } =
      this.resolveParams();
    new ScheduledLambda(this, 'ScheduledLambda', {
      lambdaProps: {
        entry: path.join(__dirname, '..', '..', 'handler', 'schedule-handler.ts'),
        handler: 'scheduleHandler',
        description: 'scheduled tweet bot',
        environment: {
          CONSUMER_KEY: consumerKey,
          CONSUMER_KEY_SECRET: consumerKeySecret,
          ACCESS_KEY: accessKey,
          ACCESS_KEY_SECRET: accessKeySecret,
          OPENAI_API_KEY: openaiApiKey,
        },
      },
      ruleProps: {
        schedule: Schedule.cron({
          minute: '0',
          hour: '9-18',
          day: '?',
          month: '*',
          year: '*',
        }),
      },
    });
  }
  private resolveParams(): {
    consumerKey: any;
    consumerKeySecret: any;
    accessKey: any;
    accessKeySecret: any;
    openaiApiKey: any;
  } {
    return {
      consumerKey: StringParameter.valueFromLookup(
        this,
        '/twitter-bot/twitter-client/consumer-key'
      ),
      consumerKeySecret: StringParameter.valueFromLookup(
        this,
        '/twitter-bot/twitter-client/consumer-key-secret'
      ),
      accessKey: StringParameter.valueFromLookup(this, '/twitter-bot/twitter-client/access-key'),
      accessKeySecret: StringParameter.valueFromLookup(
        this,
        '/twitter-bot/twitter-client/access-key-secret'
      ),
      openaiApiKey: StringParameter.valueFromLookup(this, '/twitter-bot/openai-api-key'),
    };
  }
}
