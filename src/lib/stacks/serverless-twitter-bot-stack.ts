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
        schedule: Schedule.expression('cron(0 8-17 * * ? *)'),
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
      consumerKey: StringParameter.fromStringParameterAttributes(this, 'ConsumerKey', {
        parameterName: '/twitter-bot/twitter-client/consumer-key',
      }).stringValue,
      consumerKeySecret: StringParameter.fromStringParameterAttributes(this, 'ConsumerKeySecret', {
        parameterName: '/twitter-bot/twitter-client/consumer-key-secret',
      }).stringValue,
      accessKey: StringParameter.fromStringParameterAttributes(this, 'AccessKey', {
        parameterName: '/twitter-bot/twitter-client/access-key',
      }).stringValue,
      accessKeySecret: StringParameter.fromStringParameterAttributes(this, 'AccessKeySecret', {
        parameterName: '/twitter-bot/twitter-client/access-key-secret',
      }).stringValue,
      openaiApiKey: StringParameter.fromStringParameterAttributes(this, 'OpenAiApiKey', {
        parameterName: '/twitter-bot/openai-api-key',
      }).stringValue,
    };
  }
}
