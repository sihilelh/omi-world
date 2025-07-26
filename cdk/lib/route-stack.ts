import { App, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

interface LambdaRouteFunction {
  name: string;
  path: string;
  methods: HttpMethod[];
  fn: NodejsFunction;
}

export class RouteStack extends Stack {
  private readonly httpApi: HttpApi;
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Initialize http api
    this.httpApi = new HttpApi(this, "OmiApi");

    // Initialize Lambda Functions
    const lambdaFunctions = this.initializeLambdaFunctions(this);

    // Initilize Routes
    this.initializeRoutes(lambdaFunctions);

    // Output Http Api Endpoint
    new CfnOutput(this, "HttpApiEndpoint", {
      value: this.httpApi.apiEndpoint,
      description: "The endpoint URL of the HTTP API",
    });
  }

  private initializeLambdaFunctions(scope: RouteStack): LambdaRouteFunction[] {
    const lambdaRoutes = [
      {
        name: "HealthLambda",
        path: "/health",
        methods: [HttpMethod.ANY],
        fn: new NodejsFunction(scope, "HealthLambda", {
          entry: "lambda/health.ts",
          handler: "handler",
          runtime: Runtime.NODEJS_20_X,
        }),
      },
    ];
    return lambdaRoutes;
  }

  private initializeRoutes(lambdaFunctions: LambdaRouteFunction[]) {
    for (const lmd of lambdaFunctions) {
      this.httpApi.addRoutes({
        path: lmd.path,
        methods: lmd.methods,
        integration: new HttpLambdaIntegration(
          `${lmd.name}Integration`,
          lmd.fn
        ),
      });
    }
  }
}
