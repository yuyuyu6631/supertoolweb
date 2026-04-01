"use client";

import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { AuthApiError, type AuthUser, registerAuth } from "@/src/app/lib/auth-api";
import AuthField from "./AuthField";
import PasswordField from "./PasswordField";

interface RegisterFormProps {
  onSuccess?: (user: AuthUser) => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreed?: string;
    form?: string;
  }>({});

  function validate() {
    const nextErrors: typeof errors = {};

    if (!username.trim()) {
      nextErrors.username = "请先填写一个你想使用的用户名。";
    } else if (username.trim().length < 2) {
      nextErrors.username = "用户名至少保留 2 个字符。";
    }

    if (!email.trim()) {
      nextErrors.email = "请输入邮箱地址。";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "这个邮箱格式看起来不太对，请再检查一下。";
    }

    if (!password.trim()) {
      nextErrors.password = "请设置登录密码。";
    } else if (password.length < 8) {
      nextErrors.password = "密码至少 8 位，安全性会更稳妥一些。";
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = "请再次输入一次密码。";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "两次输入的密码还不一致，请重新确认。";
    }

    if (!agreed) {
      nextErrors.agreed = "注册前需要先勾选用户协议。";
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
      const user = await registerAuth({
        username: username.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        agreed,
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

      setErrors({ form: "注册请求失败了，请确认后端服务已经启动，再稍后重试。" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField
          label="用户名"
          name="username"
          placeholder="例如：AI探索者"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          error={errors.username}
          disabled={loading}
        />
        <AuthField
          label="邮箱"
          name="email"
          type="email"
          inputMode="email"
          placeholder="name@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          disabled={loading}
        />
      </div>

      <div className="space-y-4">
        <PasswordField
          label="密码"
          name="password"
          placeholder="请设置密码"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          disabled={loading}
        />
        <PasswordField
          label="确认密码"
          name="confirmPassword"
          placeholder="请再次输入密码"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={errors.confirmPassword}
          disabled={loading}
        />
      </div>

      <div>
        <label className="inline-flex items-start gap-3 text-sm leading-6 text-slate-600">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            disabled={loading}
            className="auth-checkbox mt-1 h-4 w-4 rounded border-slate-300"
          />
          <span>我已阅读并同意用户协议与隐私说明</span>
        </label>
        {errors.agreed ? <p className="mt-2 text-sm text-rose-600">{errors.agreed}</p> : null}
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
            正在注册...
          </>
        ) : (
          "注册"
        )}
      </button>
    </form>
  );
}
