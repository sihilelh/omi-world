import * as CDK from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as LambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as ApiGateway from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

export class CommonStack extends CDK.Stack {
  constructor(scope: CDK.App, id: string, props?: CDK.StackProps) {
    super(scope, id, props);

    const helloLambda = new LambdaNode.NodejsFunction(this, "HelloLambda", {
      entry: "lambda/hello.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
    });

    const httpApi = new ApiGateway.HttpApi(this, "CardGameApi");

    httpApi.addRoutes({
      path: "/hello",
      methods: [ApiGateway.HttpMethod.GET],
      integration: new HttpLambdaIntegration("HelloIntegration", helloLambda),
    });
  }
}
