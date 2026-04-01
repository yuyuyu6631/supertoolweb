"use client";

import AuthCard from "../components/auth/AuthCard";
import AuthLayout from "../components/auth/AuthLayout";

interface AuthPageProps {
  nextHref?: string;
}

export default function AuthPage({ nextHref }: AuthPageProps) {
  return (
    <AuthLayout>
      <AuthCard nextHref={nextHref} />
    </AuthLayout>
  );
}
