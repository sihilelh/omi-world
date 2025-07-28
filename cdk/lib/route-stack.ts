import { App, CfnOutput, Stack, StackProps, Fn } from "aws-cdk-lib";
import {
  HttpApi,
  HttpMethod,
  CorsHttpMethod,
  WebSocketApi,
  WebSocketStage,
} from "aws-cdk-lib/aws-apigatewayv2";
import {
  HttpLambdaIntegration,
  WebSocketLambdaIntegration,
} from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { CommonStack } from "./common-stack";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

interface LambdaRouteFunction {
  name: string;
  path: string;
  methods: HttpMethod[];
  fn: NodejsFunction;
}

export class RouteStack extends Stack {
  private readonly httpApi: HttpApi;
  public readonly env: Record<string, string>;
  constructor(
    scope: App,
    id: string,
    commonStack: CommonStack,
    props?: StackProps
  ) {
    super(scope, id, props);

    const userPoolId = Fn.importValue("CommonStack-UserPoolId");
    const userPoolClientId = Fn.importValue("CommonStack-UserPoolClientId");

    const connectionsTableName = Fn.importValue(
      "CommonStack-ConnectionsTableName"
    );
    const roundsTableName = Fn.importValue("CommonStack-RoundsTableName");
    const movesTableName = Fn.importValue("CommonStack-MovesTableName");
    const sessionsTableName = Fn.importValue("CommonStack-SessionsTableName");

    this.env = {
      USER_POOL_ID: userPoolId,
      USER_POOL_CLIENT_ID: userPoolClientId,
      SESSIONS_TABLE_NAME: sessionsTableName,
      ROUNDS_TABLE_NAME: roundsTableName,
      MOVES_TABLE_NAME: movesTableName,
      CONNECTIONS_TABLE_NAME: connectionsTableName,
    };

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

    // Initilize WebSocket Api
    this.initializeWebSocketApi(this, commonStack);
    // Initialize Routes
    this.initializeRoutes(lambdaFunctions);

    // Output Http Api Endpoint
    new CfnOutput(this, "HttpApiEndpoint", {
      value: this.httpApi.apiEndpoint,
      description: "The endpoint URL of the HTTP API",
      exportName: "RouteStack-HttpApiEndpoint",
    });
  }

  private initializeWebSocketApi(scope: RouteStack, commonStack: CommonStack) {
    const WebSocketConnectLambda = new NodejsFunction(
      scope,
      "WebSocketConnectLambda",
      {
        entry: "lambda/ws/connect.ts",
        handler: "handler",
        runtime: Runtime.NODEJS_20_X,
        environment: this.env,
      }
    );

    const WebSocketDisconnectLambda = new NodejsFunction(
      scope,
      "WebSocketDisconnectLambda",
      {
        entry: "lambda/ws/disconnect.ts",
        handler: "handler",
        runtime: Runtime.NODEJS_20_X,
        environment: this.env,
      }
    );

    const WebSocketDefaultLambda = new NodejsFunction(
      scope,
      "WebSocketDefaultLambda",
      {
        entry: "lambda/ws/default.ts",
        handler: "handler",
        runtime: Runtime.NODEJS_20_X,
        environment: this.env,
      }
    );

    commonStack.connectionsTable.grantReadWriteData(WebSocketConnectLambda);
    commonStack.connectionsTable.grantReadWriteData(WebSocketDisconnectLambda);

    commonStack.connectionsTable.grantReadWriteData(WebSocketDefaultLambda);
    commonStack.sessionTable.grantReadWriteData(WebSocketDefaultLambda);
    commonStack.roundsTable.grantReadWriteData(WebSocketDefaultLambda);
    commonStack.movesTable.grantReadWriteData(WebSocketDefaultLambda);

    const webSocketApi = new WebSocketApi(this, "OmiWebSocketApi", {
      apiName: "OmiWebSocketApi",
      connectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "WebSocketConnectLambdaIntegration",
          WebSocketConnectLambda
        ),
      },
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "WebSocketDisconnectLambdaIntegration",
          WebSocketDisconnectLambda
        ),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "WebSocketDefaultLambdaIntegration",
          WebSocketDefaultLambda
        ),
      },
    });

    const webSocketStage = new WebSocketStage(this, "OmiWebSocketStage", {
      webSocketApi,
      stageName: "dev",
      autoDeploy: true,
    });

    // Allow default handler to post messages to connected clients
    const connectionsArns = scope.formatArn({
      service: "execute-api",
      resource: webSocketApi.apiId,
      resourceName: `${webSocketStage.stageName}/POST/*`,
    });

    WebSocketDefaultLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["execute-api:PostToConnection"],
        resources: [connectionsArns],
      })
    );

    // Output WebSocket Api Endpoint
    new CfnOutput(this, "WebSocketApiEndpoint", {
      value: webSocketApi.apiEndpoint,
      description: "The endpoint URL of the WebSocket API",
      exportName: "RouteStack-WebSocketApiEndpoint",
    });

    return { webSocketApi, webSocketStage };
  }

  private initializeLambdaFunctions(
    scope: RouteStack,
    commonStack: CommonStack
  ): LambdaRouteFunction[] {
    const websocketEndpoint = Fn.importValue("RouteStack-WebSocketApiEndpoint");

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
        WEBSOCKET_ENDPOINT: websocketEndpoint,
        ...this.env,
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
