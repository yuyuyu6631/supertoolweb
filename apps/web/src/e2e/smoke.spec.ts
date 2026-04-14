import { expect, test } from "@playwright/test";

test("desktop and mobile menus are clickable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });

  const desktopChecks = [
    { name: "logo", click: () => page.locator("header").getByRole("link", { name: "星点评品牌标识" }).click(), expected: "**/" },
    { name: "首页", click: () => page.locator("header").getByRole("link", { name: "首页", exact: true }).click(), expected: "**/" },
    { name: "工具目录", click: () => page.locator("header").getByRole("link", { name: "工具目录", exact: true }).click(), expected: "**/tools" },
    { name: "榜单", click: () => page.locator("header").getByRole("link", { name: "榜单", exact: true }).click(), expected: "**/rankings" },
    { name: "场景", click: () => page.locator("header").getByRole("link", { name: "场景", exact: true }).click(), expected: "**/scenarios" },
    { name: "浏览工具", click: () => page.locator("header").getByRole("link", { name: "浏览工具" }).click(), expected: "**/tools" },
    { name: "登录 / 注册", click: () => page.locator("header").getByRole("link", { name: "登录 / 注册" }).first().click(), expected: /\/auth\?next=/ },
    { name: "footer:返回工具目录", click: () => page.locator("footer").getByRole("link", { name: "返回工具目录" }).click(), expected: "**/tools" },
  ] as const;

  for (const check of desktopChecks) {
    await page.goto("/", { waitUntil: "networkidle" });
    await check.click();
    await page.waitForURL(check.expected);
  }

  await page.setViewportSize({ width: 390, height: 844 });

  const mobileChecks = [
    { name: "mobile:首页", linkName: "首页", expected: "**/" },
    { name: "mobile:工具目录", linkName: "工具目录", expected: "**/tools" },
    { name: "mobile:榜单", linkName: "榜单", expected: "**/rankings" },
    { name: "mobile:场景", linkName: "场景", expected: "**/scenarios" },
    { name: "mobile:登录 / 注册", linkName: "登录 / 注册", expected: /\/auth\?next=/ },
  ] as const;

  for (const check of mobileChecks) {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("button", { name: "打开导航" }).click();
    await page.getByRole("link", { name: check.linkName, exact: true }).click();
    await page.waitForURL(check.expected);
  }
});

test("core directory path, rankings, and scenarios use live routes", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: "开始筛选" })).toBeVisible();

  await page.getByPlaceholder("想写文案、做海报、写代码？直接告诉我你的任务。").fill("AI");
  await page.getByRole("button", { name: "开始筛选" }).click();
  await expect(page).toHaveURL(/\/tools\?q=AI/);
  await expect(page.getByRole("heading", { name: "搜索结果" })).toBeVisible();

  const detailLink = page.getByRole("link", { name: "查看详情" }).first();
  await detailLink.click();
  await expect(page).toHaveURL(/\/tools\/.+/);

  const externalLink = page.getByRole("link", { name: /访问官网/ }).first();
  await expect(externalLink).toBeVisible();

  await page.goto("/rankings", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "严选工具榜单" })).toBeVisible();

  await page.goto("/scenarios", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "按真实人群和场景找工具" })).toBeVisible();
});

test("matches route shows candidate card and drawer", async ({ page }) => {
  await page.goto("/matches", { waitUntil: "networkidle" });

  await expect(page.getByTestId("match-card")).toBeVisible();
  await expect(page.getByRole("button", { name: "同频" })).toBeVisible();
  await page.getByRole("button", { name: "同频" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
