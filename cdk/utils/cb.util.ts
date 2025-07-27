export const cb = (
  status: number,
  body?: Record<string, any>,
  options?: {
    headers?: Record<string, string>;
  }
) => {
  return {
    statusCode: status,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  };
};

export const cbError = (
  status: number,
  body: Record<string, any>,
  options: {
    error: any; // Thrown error
    headers?: Record<string, string>;
  }
) => {
  return {
    statusCode: status,
    body: JSON.stringify({
      ...body,
      error: options?.error?.message || options?.error || "Unknown error",
    }),
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  };
};
