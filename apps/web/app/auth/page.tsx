import AuthPage from "@/src/app/pages/AuthPage";

interface AuthRouteProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
}

export default async function Page({ searchParams }: AuthRouteProps) {
  const params = await searchParams;

  return <AuthPage nextHref={readValue(params.next)} />;
}
