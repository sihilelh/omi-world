import { CognitoJwtVerifier } from "aws-jwt-verify";

const userPoolId = process.env.USER_POOL_ID;
const userPoolClientId = process.env.USER_POOL_CLIENT_ID;

console.log("Auth util - User Pool ID:", userPoolId);
console.log("Auth util - User Pool Client ID:", userPoolClientId);

if (!userPoolId || !userPoolClientId) {
  throw new Error("USER_POOL_ID and USER_POOL_CLIENT_ID environment variables are required");
}

const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: userPoolId,
  clientId: userPoolClientId,
  tokenUse: "access",
});

export const verifyCognitoToken = async (token: string) => {
  try {
    const payload = await cognitoVerifier.verify(token);
    return payload;
  } catch (err) {
    console.error("Token verification failed: ", err);
    return null;
  }
};
