import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import {
  verifyCognitoToken,
  extractTokenFromHeaders,
} from "../utils/auth.util";
import { CognitoAccessTokenPayload } from "aws-jwt-verify/jwt-model";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { cb, cbError } from "../utils/cb.util";
import { broadcastToSession } from "../utils/websocket.util";

const dynamoDBClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const SESSIONS_TABLE = process.env.SESSIONS_TABLE_NAME || "OmiWorldSessions";
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT;

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
      case "GET":
        console.log("GET request received, proceeding to get session");
        return await getSession(event);
      case "POST":
        console.log("POST request received, proceeding to create session");
        return await createSession(event);
      case "PUT":
        console.log("PUT request received, proceeding to join session");
        return await joinSession(event);
      default:
        return cb(405, {
          error: "Method Not Allowed",
          message: `HTTP method ${httpMethod} not supported`,
          allowedMethods: ["POST", "PUT", "GET"],
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

    // Get token from Authorization header
    const token = extractTokenFromHeaders(event);
    if (!token) {
      return cb(401, {
        error: "Unauthorized: Please provide an Authorization header",
      });
    }

    const user: CognitoAccessTokenPayload | null = await verifyCognitoToken(
      token
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
      status: "waiting",
      createdUser: createdUser,
      currentActiveSlot: 0,
      currentRound: 0,
      teams: [
        {
          teamId: "TEAM_RED",
          score: 10,
        },
        {
          teamId: "TEAM_BLACK",
          score: 10,
        },
      ],
      players: [
        {
          userId: createdUser,
          team: "TEAM_RED",
          slot: 0,
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

const joinSession = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const sessionId = event.pathParameters?.sessionId;

    if (!sessionId) {
      return cb(400, { error: "Session ID is required" });
    }

    // Get token from Authorization header
    const token = extractTokenFromHeaders(event);
    if (!token) {
      return cb(401, {
        error: "Unauthorized: Please provide an Authorization header",
      });
    }

    const body = JSON.parse(event.body || "{}");

    if (!body?.team) {
      return cb(400, { error: "Team is required" });
    }

    // Check if the provided team is valid
    const validTeams = ["TEAM_RED", "TEAM_BLACK"];
    if (!validTeams.includes(body.team)) {
      return cb(400, { error: "Invalid team" });
    }

    const user: CognitoAccessTokenPayload | null = await verifyCognitoToken(
      token
    );

    if (!user) {
      return cb(401, { error: "Unauthorized: Please access token is invalid" });
    }

    const joiningUser = user.username;

    const sessionData = await docClient.send(
      new GetCommand({
        TableName: SESSIONS_TABLE,
        Key: { pk: sessionId },
      })
    );

    if (!sessionData.Item) {
      return cb(404, { error: "Session not found" });
    }

    const session = sessionData.Item;

    if (session.status !== "waiting") {
      return cb(400, { error: "Session is not open for joining" });
    }

    // Each team only can have 2 players and total players in a session is 4

    // Validate total players in session
    if (Array.isArray(session.players)) {
      if (session.players.length >= 4) {
        return cb(400, {
          error: "Session is full. Maximum 4 players allowed.",
        });
      }
    } else {
      session.players = [];
    }

    // Validate team size
    const teamPlayers = session.players.filter(
      (p: any) => p.team === body.team
    );
    if (teamPlayers.length >= 2) {
      return cb(400, {
        error: `Team ${body.team} is full. Maximum 2 players per team.`,
      });
    }

    // Prevent duplicate join
    if (session.players.some((p: any) => p.userId === joiningUser)) {
      return cb(400, { error: "User already joined the session." });
    }

    // Generating the next slot for the user
    // Team red only can only have 0 and 2 slots
    // Team black only can only have 1 and 3 slots
    const playersInTeamCount = session.players.filter(
      (p: any) => p.team === body.team
    ).length;
    let slot;
    if (body.team === "TEAM_RED" && playersInTeamCount === 0) {
      slot = 0;
    } else if (body.team === "TEAM_RED" && playersInTeamCount === 1) {
      slot = 2;
    } else if (body.team === "TEAM_BLACK" && playersInTeamCount === 0) {
      slot = 1;
    } else if (body.team === "TEAM_BLACK" && playersInTeamCount === 1) {
      slot = 3;
    }

    // Update session data
    session.players.push({
      userId: joiningUser,
      team: body.team,
      slot,
    });

    await docClient.send(
      new PutCommand({
        TableName: SESSIONS_TABLE,
        Item: session,
      })
    );

    // Broadcast user joined message to all session participants
    if (WEBSOCKET_ENDPOINT) {
      try {
        await broadcastToSession(
          {
            action: "USER_JOINED",
            body: {
              userId: joiningUser,
              team: body.team,
              sessionId,
            },
          },
          sessionId,
          WEBSOCKET_ENDPOINT
        );

        console.log("Session Lambda - User joined broadcast sent:", {
          sessionId,
          userId: joiningUser,
          team: body.team,
        });
      } catch (broadcastError) {
        console.error("Session Lambda - Broadcast error:", broadcastError);
        // Don't fail the join operation if broadcast fails
      }
    } else {
      console.warn("Session Lambda - WebSocket endpoint not configured");
    }

    return cb(200, {
      message: "Session joined",
      sessionId,
      sessionData: session,
    });
  } catch (error) {
    console.log(`Error joining session:`, error);
    return cbError(500, { error: "Failed to join session" }, { error });
  }
};

const getSession = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const sessionId = event.pathParameters?.sessionId;

    if (!sessionId) {
      return cb(400, { error: "Session ID is required" });
    }
    // Fetch the session from DynamoDB
    const result = await docClient.send(
      new GetCommand({
        TableName: SESSIONS_TABLE,
        Key: { pk: sessionId },
      })
    );

    if (!result.Item) {
      return cb(404, { error: "Session not found" });
    }

    return cb(200, {
      sessionId,
      sessionData: result.Item,
    });
  } catch (error) {
    console.log(`Error getting session:`, error);
    return cbError(500, { error: "Failed to get session" }, { error });
  }
};
