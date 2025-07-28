import { App, CfnOutput, Stack, StackProps, Fn } from "aws-cdk-lib";
import {
  HttpApi,
  HttpMethod,
  CorsHttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { CommonStack } from "./common-stack";

interface LambdaRouteFunction {
  name: string;
  path: string;
  methods: HttpMethod[];
  fn: NodejsFunction;
}

export class RouteStack extends Stack {
  private readonly httpApi: HttpApi;
  constructor(
    scope: App,
    id: string,
    commonStack: CommonStack,
    props?: StackProps
  ) {
    super(scope, id, props);

    // Initialize http api with CORS support
    this.httpApi = new HttpApi(this, "OmiApi", {
      corsPreflight: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
        ],
        allowMethods: [
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.DELETE,
        ],
        allowOrigins: [
          "http://localhost:5173", // Vite dev server
        ],
        allowCredentials: true,
      },
    });

    // Initialize Lambda Functions
    const lambdaFunctions = this.initializeLambdaFunctions(this, commonStack);

    // Initilize Routes
    this.initializeRoutes(lambdaFunctions);

    // Output Http Api Endpoint
    new CfnOutput(this, "HttpApiEndpoint", {
      value: this.httpApi.apiEndpoint,
      description: "The endpoint URL of the HTTP API",
    });
  }

  private initializeLambdaFunctions(
    scope: RouteStack,
    commonStack: CommonStack
  ): LambdaRouteFunction[] {
    // Import the user pool and client IDs from CommonStack
    const userPoolId = Fn.importValue("CommonStack-UserPoolId");
    const userPoolClientId = Fn.importValue("CommonStack-UserPoolClientId");
    const sessionsTableName = Fn.importValue("CommonStack-SessionsTableName");

    const healthLambda = new NodejsFunction(scope, "HealthLambda", {
      entry: "lambda/health.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
    });

    const sessionLambda = new NodejsFunction(scope, "SessionLambda", {
      entry: "lambda/session.ts",
      handler: "handler",
      runtime: Runtime.NODEJS_20_X,
      environment: {
        USER_POOL_ID: userPoolId,
        USER_POOL_CLIENT_ID: userPoolClientId,
        SESSIONS_TABLE_NAME: sessionsTableName,
      },
    });

    commonStack.sessionTable.grantReadWriteData(sessionLambda);

    const lambdaRoutes = [
      {
        name: "HealthLambda",
        path: "/health",
        methods: [HttpMethod.ANY],
        fn: healthLambda,
      },
      {
        name: "SessionLambda",
        path: "/sessions",
        methods: [HttpMethod.POST],
        fn: sessionLambda,
      },
      {
        name: "SessionLambda",
        path: "/sessions/{sessionId}",
        methods: [HttpMethod.PUT, HttpMethod.GET],
        fn: sessionLambda,
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
