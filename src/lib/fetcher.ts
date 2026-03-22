export class ApiError extends Error {
  readonly status: number;
  readonly errorCode: string | undefined;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

const parseErrorPayload = (text: string) => {
  if (!text) {
    return {
      message: undefined,
      errorCode: undefined,
    };
  }

  try {
    const parsed = JSON.parse(text) as { message?: string; errorCode?: string };
    return {
      message: parsed?.message,
      errorCode: parsed?.errorCode,
    };
  } catch {
    return {
      message: text,
      errorCode: undefined,
    };
  }
};

export const fetchJson = async <T>(input: RequestInfo | URL, init?: RequestInit) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    const text = await response.text();
    const { message, errorCode } = parseErrorPayload(text);
    throw new ApiError(
      message || response.statusText || "Request failed",
      response.status,
      errorCode,
    );
  }

  return (await response.json()) as T;
};
