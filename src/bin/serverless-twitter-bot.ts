#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServerlessTwitterBotStack } from '../lib/stacks/serverless-twitter-bot-stack';

const app = new cdk.App();
new ServerlessTwitterBotStack(app, 'ServerlessTwitterBotStack', {
  stackName: 'ServerlessTwitterBotStack',
  env: {
    account: '062361541617',
    region: 'eu-west-1',
  },
});
