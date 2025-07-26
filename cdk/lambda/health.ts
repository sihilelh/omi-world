export const handler = async (event: any) => {
  const healthData = {
    isRunning: true,
    timestamp: new Date().toISOString(),
  };
  return {
    statusCode: 200,
    body: JSON.stringify(healthData),
  };
};
