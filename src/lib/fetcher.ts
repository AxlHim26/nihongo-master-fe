export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const getErrorMessage = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return response.statusText || "Request failed";
  }

  try {
    const parsed = JSON.parse(text) as { message?: string };
    if (parsed?.message) {
      return parsed.message;
    }
  } catch {
    return text;
  }

  return response.statusText || "Request failed";
};

export const fetchJson = async <T>(input: RequestInfo | URL, init?: RequestInit) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    const message = await getErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
};
