"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { AlertCircle } from "lucide-react";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(function AuthField(
  { label, hint, error, className, id, disabled, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={[
          "auth-input w-full rounded-2xl px-4 py-3.5 text-sm text-slate-900 outline-none transition",
          error ? "auth-input-error" : "",
          disabled ? "cursor-not-allowed" : "",
          className ?? "",
        ].join(" ")}
        {...props}
      />
      {error ? (
        <span id={`${inputId}-error`} className="mt-2 inline-flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} className="mt-2 block text-sm text-slate-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
});

export default AuthField;
