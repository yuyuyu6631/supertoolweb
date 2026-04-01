import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "../AuthProvider";
import AuthCard, { resolveNextHref } from "../AuthCard";

const mockFetch = vi.fn();

function renderWithProvider(ui: ReactNode) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

describe("AuthCard", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to tools when next href contains malformed encoding", () => {
    expect(resolveNextHref("/tools?category=ai-%E9%9F%B3%E9%A2%91%")).toBe("/tools");
  });

  it("switches between login and register tabs", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: "当前未登录。" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    renderWithProvider(<AuthCard />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "登录星点评" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "注册" }));

    expect(screen.getByRole("heading", { name: "加入星点评" })).toBeInTheDocument();
    expect(screen.getByLabelText("用户名")).toBeInTheDocument();
  });

  it("shows password toggle, disables social buttons, and submits login", async () => {
    mockFetch
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ detail: "当前未登录。" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 1,
            username: "demo-user",
            email: "demo@example.com",
            status: "active",
            createdAt: "2026-03-31T00:00:00Z",
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

    renderWithProvider(<AuthCard nextHref="/tools?category=chatbot" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "登录星点评" })).toBeInTheDocument();
    });

    expect(screen.getByText("登录成功后将返回上一页。")).toBeInTheDocument();
    expect(screen.queryByText("/tools?category=chatbot")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "QQ 登录" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "微信登录" })).toBeDisabled();
    expect(screen.getByText("QQ / 微信登录暂未开放，请先使用账号密码登录。")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("邮箱或用户名"), { target: { value: "demo@example.com" } });
    fireEvent.change(screen.getByLabelText("密码"), { target: { value: "12345678" } });

    fireEvent.click(screen.getByRole("button", { name: "显示密码" }));
    expect(screen.getByRole("button", { name: "隐藏密码" })).toBeInTheDocument();

    fireEvent.click(screen.getByText("登录", { selector: "button[type='submit']" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
