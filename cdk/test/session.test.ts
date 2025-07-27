import { handler } from '../lambda/session';

describe('Session Lambda', () => {
  it('should return 400 for unsupported HTTP methods', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/sessions',
      body: null,
    } as any;

    const result = await handler(event);
    expect(result.statusCode).toBe(400);
  });

  it('should return 401 when no token is provided', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/sessions',
      body: JSON.stringify({}),
    } as any;

    const result = await handler(event);
    expect(result.statusCode).toBe(401);
  });

  it('should return 401 when invalid token is provided', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/sessions',
      body: JSON.stringify({ token: 'invalid-token' }),
    } as any;

    const result = await handler(event);
    expect(result.statusCode).toBe(401);
  });
}); 