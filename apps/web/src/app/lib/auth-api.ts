export type AuthUser = {
  id: number;
  username: string;
  email: string;
  status: string;
  createdAt: string;
};

type ErrorDetail = string | Record<string, string> | null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class AuthApiError extends Error {
  status: number;
  detail: ErrorDetail;

  constructor(status: number, message: string, detail: ErrorDetail = null) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const detail = payload && typeof payload === "object" && "detail" in payload ? (payload.detail as ErrorDetail) : null;
    const fallbackMessage = typeof detail === "string" ? detail : "请求失败，请稍后再试。";
    throw new AuthApiError(response.status, fallbackMessage, detail);
  }

  return payload as T;
}

export async function loginAuth(payload: { identifier: string; password: string }): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerAuth(payload: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
}): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    return await request<AuthUser>("/api/auth/me", {
      method: "GET",
      headers: {},
    });
  } catch (error) {
    if (error instanceof AuthApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function logoutAuth(): Promise<void> {
  await request<void>("/api/auth/logout", {
    method: "POST",
    headers: {},
  });
}
