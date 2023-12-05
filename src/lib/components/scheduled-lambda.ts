import { Duration } from 'aws-cdk-lib';
import { Rule, RuleProps, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

type ScheduledLambdaProps = {
  lambdaProps: NodejsFunctionProps;
  ruleProps: Omit<RuleProps, 'targets'>;
};

const lambdaDefaults: NodejsFunctionProps = {
  timeout: Duration.seconds(5),
  memorySize: 128,
  bundling: {
    minify: true,
  },
  runtime: Runtime.NODEJS_20_X,
};

export class ScheduledLambda extends Construct {
  lambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: ScheduledLambdaProps) {
    super(scope, id);

    this.lambda = this.createLambda(props.lambdaProps);
    this.scheduleLambda({ ...props.ruleProps, schedule: props.ruleProps.schedule });
  }

  private createLambda(lambdaProps: NodejsFunctionProps) {
    const lambda = new NodejsFunction(this, 'ScheduledLambda', {
      ...lambdaDefaults,
      ...lambdaProps,
      initialPolicy: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['ssm:GetParameter'],
          resources: ['*'],
        }),
      ],
    });
    return lambda;
  }

  private scheduleLambda(ruleProps: Omit<RuleProps, 'targets'>) {
    new Rule(this, 'ScheduledLambdaRule', {
      ...ruleProps,
      targets: [new LambdaFunction(this.lambda)],
    });
  }
}
