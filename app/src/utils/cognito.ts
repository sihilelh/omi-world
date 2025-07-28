export const getCognitoToken = () => {
  // Get all cookies as a string
  const cookieString = document.cookie;

  // Try to find the accessToken in cookies
  const accessTokenRegex =
    /CognitoIdentityServiceProvider\..*\.accessToken=([^;]*)/;
  const match = cookieString?.match(accessTokenRegex);

  if (match) {
    return match[1];
  }

  // If not found in cookies, check localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.match(/^CognitoIdentityServiceProvider\..*\.accessToken$/)) {
      return localStorage.getItem(key);
    }
  }

  // If not found, return null
  return null;
};
