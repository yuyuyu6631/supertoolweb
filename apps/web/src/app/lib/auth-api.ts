export type AuthUser = {
  id: number;
  username: string;
  email: string;
  status: string;
  createdAt: string;
  role?: string;
};

type ErrorDetail = string | Record<string, string> | null;
type ReadinessReason =
  | "ready"
  | "unreachable"
  | "persistent_database_required"
  | "database_unavailable"
  | "catalog_query_failed"
  | "auth_query_failed"
  | "service_not_ready";

export type BackendAvailability = "ready" | "unreachable" | "not_ready";

export interface BackendReadiness {
  state: BackendAvailability;
  reason: ReadinessReason;
  message: string | null;
}

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

function readinessMessage(reason: ReadinessReason): string | null {
  if (reason === "ready") {
    return null;
  }
  if (reason === "unreachable") {
    return "当前无法连接后端服务，请先确认 API 已启动。";
  }
  if (
    reason === "persistent_database_required"
    || reason === "database_unavailable"
    || reason === "catalog_query_failed"
    || reason === "auth_query_failed"
  ) {
    return "后端已经响应，但数据库或鉴权还没准备好。请先确认 MySQL 可用后再重试。";
  }
  return "后端已经启动，但服务还没有准备完成，请稍后再试。";
}

export async function fetchBackendReadiness(): Promise<BackendReadiness> {
  try {
    const response = await fetch(`${API_BASE_URL}/health/ready`, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : null;
    const reason =
      payload && typeof payload === "object" && "reason" in payload && typeof payload.reason === "string"
        ? (payload.reason as ReadinessReason)
        : response.ok
          ? "ready"
          : "service_not_ready";

    if (response.ok) {
      return { state: "ready", reason: "ready", message: null };
    }

    return {
      state: "not_ready",
      reason,
      message: readinessMessage(reason),
    };
  } catch {
    return {
      state: "unreachable",
      reason: "unreachable",
      message: readinessMessage("unreachable"),
    };
  }
}

export async function resolveAuthFailureMessage(): Promise<string> {
  const readiness = await fetchBackendReadiness();
  return readiness.message || "服务暂时不可用，请稍后再试。";
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
