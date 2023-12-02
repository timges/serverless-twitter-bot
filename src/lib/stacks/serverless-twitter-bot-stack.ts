import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScheduledLambda } from '../components/scheduled-lambda';
import path = require('path');
import { Schedule } from 'aws-cdk-lib/aws-events';

export class ServerlessTwitterBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ScheduledLambda(this, 'ScheduledLambda', {
      lambdaProps: {
        handler: path.join(__dirname, '../handler/schedule-handler.ts'),
        description: 'scheduled tweet bot',
        environment: {
          CONSUMER_KEY: process.env.CONSUMER_KEY as string,
          CONSUMER_KEY_SECRET: process.env.CONSUMER_KEY_SECRET as string,
          ACCESS_KEY: process.env.ACCESS_KEY as string,
          ACCESS_KEY_SECRET: process.env.ACCESS_KEY_SECRET as string,
          OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
        }
      },
      ruleProps: {
        schedule: Schedule.rate(cdk.Duration.hours(4)),
      },
    });
  }
}
