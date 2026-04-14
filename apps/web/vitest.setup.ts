import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock("next-view-transitions", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: React.PropsWithChildren<{ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>) =>
    React.createElement("a", { href, ...rest }, children),
}));
