"use client";

import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AuthApiError, type AuthUser, loginAuth } from "@/src/app/lib/auth-api";
import AuthField from "./AuthField";
import PasswordField from "./PasswordField";
import SocialLoginButtons from "./SocialLoginButtons";

interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});

  function validate() {
    const nextErrors: typeof errors = {};

    if (!identifier.trim()) {
      nextErrors.identifier = "请输入邮箱或用户名，方便我们确认你的账号。";
    }

    if (!password.trim()) {
      nextErrors.password = "请输入密码后再继续登录。";
    } else if (password.trim().length < 8) {
      nextErrors.password = "这个密码看起来太短了，请再检查一下。";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const user = await loginAuth({
        identifier: identifier.trim(),
        password,
      });
      setErrors({});
      onSuccess?.(user);
    } catch (error) {
      if (error instanceof AuthApiError) {
        if (typeof error.detail === "object" && error.detail !== null) {
          setErrors((current) => ({ ...current, ...(error.detail as Record<string, string>) }));
        } else {
          setErrors({ form: error.message });
        }
        return;
      }

      setErrors({ form: "登录请求失败了，请确认后端服务已经启动，再稍后重试。" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <AuthField
          label="邮箱或用户名"
          name="identifier"
          placeholder="请输入邮箱或用户名"
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          error={errors.identifier}
          disabled={loading}
        />
        <PasswordField
          label="密码"
          name="password"
          placeholder="请输入密码"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          disabled={loading}
        />
      </div>

      {errors.form ? <p className="rounded-2xl bg-slate-900/5 px-4 py-3 text-sm text-slate-600">{errors.form}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            正在登录...
          </>
        ) : (
          "登录"
        )}
      </button>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200/80" />
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">其他方式</span>
          <div className="h-px flex-1 bg-slate-200/80" />
        </div>
        <SocialLoginButtons disabled={loading} />
      </div>
    </form>
  );
}
