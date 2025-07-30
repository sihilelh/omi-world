import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const connectionId = event.requestContext.connectionId;
    const body = JSON.parse(event.body || "{}");

    console.log("WebSocket Default - Debug Info:", {
      connectionId,
      body,
    });

    // For now, just acknowledge the message
    // This can be extended later for handling specific message types

    switch (body?.action) {
      case "health":
        return {
          statusCode: 200,
          body: JSON.stringify({
            action: "health",
            body: {
              status: "OK",
              timestamp: new Date().toISOString(),
            },
            connectionId,
          }),
        };
        break;

      default:
        return {
          statusCode: 200,
          body: JSON.stringify({
            action: "default",
            body: {
              message: "Message received, but no valid action specified",
              mentionedAction: body?.action,
              timestamp: new Date().toISOString(),
            },
            connectionId,
          }),
        };
        break;
    }
  } catch (error) {
    console.error("WebSocket Default - Unexpected error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
      }),
    };
  }
};
