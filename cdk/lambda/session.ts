import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { verifyCognitoToken } from "../utils/auth.util";
import { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { cb, cbError } from "../utils/cb.util";

const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const SESSIONS_TABLE = process.env.SESSIONS_TABLE_NAME || "OmiWorldSessions";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const httpMethod = event.requestContext.http.method;
    const path = event.rawPath;
    const requestContext = event.requestContext;

    // Debug logging
    console.log("Session Lambda Debug Info:", {
      httpMethod,
      path,
      requestContext: {
        stage: requestContext?.stage,
      },
      headers: event.headers,
    });

    switch (httpMethod) {
      case "POST":
        console.log("POST request received, proceeding to create session");
        return await createSession(event);
      default:
        return cb(405, {
          error: "Method Not Allowed",
          message: `HTTP method ${httpMethod} not supported`,
          allowedMethods: ["POST"],
        });
    }
  } catch (error) {
    console.error("Session Lambda Error:", error);
    return cbError(
      500,
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      },
      { error }
    );
  }
};

const createSession = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    // Debug logging
    console.log("Session Lambda Debug Info:", {
      event,
    });

    const sessionId = `${Date.now().toString(36)}`;

    const body = JSON.parse(event.body || "{}");

    if (!body?.token) {
      return cb(401, {
        error: "Unauthorized: Please provide a access token",
      });
    }

    const user: CognitoAccessTokenPayload | null = await verifyCognitoToken(
      body.token
    );

    if (!user) {
      return cb(401, {
        error: "Unauthorized: Please access token is invalid",
      });
    }

    const createdUser = user.username;

    const sessionData = {
      pk: sessionId,
      createdAt: new Date().toISOString(),
      status: "active",
      createdUser: createdUser,
      currentActiveUser: createdUser,
      currentRound: 0,
      teams: [
        {
          teamId: "TEAM_1",
          score: 10,
        },
        {
          teamId: "TEAM_2",
          score: 10,
        },
      ],
      players: [
        {
          userId: createdUser,
          team: "TEAM_1",
        },
      ],
    };

    // Save session data to DynamoDB
    try {
      await docClient.send(
        new PutCommand({
          TableName: SESSIONS_TABLE,
          Item: sessionData,
        })
      );
    } catch (dbError) {
      console.error("Failed to save session to DynamoDB:", dbError);
      return cbError(
        500,
        { error: "Failed to save session to database" },
        { error: dbError }
      );
    }

    return cb(200, {
      message: "Session Created",
      sessionId,
      sessionData,
    });
  } catch (error) {
    console.log(`Error creating session:`, error);
    return cbError(500, { error: "Failed to create session" }, { error });
  }
};
