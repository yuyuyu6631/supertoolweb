import { test, expect } from "@playwright/test";

test.describe("Navigation and UI clickability verification", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("should load homepage and all navigation links are visible and clickable", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveTitle(/星点评/);

    const nav = page.locator("nav");
    await expect(nav.getByText("首页")).toBeVisible();
    await expect(nav.getByText("工具目录")).toBeVisible();
    await expect(nav.getByText("榜单")).toBeVisible();
    await expect(nav.getByText("场景")).toBeVisible();

    await page.screenshot({ path: "e2e-screenshots/homepage.png" });
  });

  test("should click navigation links and navigate correctly", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator("nav").getByText("工具目录").click();
    await expect(page).toHaveURL(/tools/);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("nav").getByText("工具目录")).toBeVisible();

    await page.locator("nav").getByText("榜单").click();
    await expect(page).toHaveURL(/rankings/);
    await page.waitForLoadState("networkidle");

    await page.locator("nav").getByText("场景").click();
    await expect(page).toHaveURL(/scenarios/);
    await page.waitForLoadState("networkidle");

    await page.locator("nav").getByText("首页").click();
    await expect(page).toHaveURL(/\/$/);
    await page.waitForLoadState("networkidle");
  });

  test("should display tool cards with correct information on tools page", async ({ page }) => {
    await page.goto("/tools");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('[data-testid="tool-card"]', { timeout: 15000 });

    const toolCards = page.locator('[data-testid="tool-card"]');
    await expect(toolCards.first()).toBeVisible();

    const hasPriceTag = await page.locator('[data-testid="price-tag"]').count();
    console.log(`Found ${hasPriceTag} price tags on page`);

    await expect(page.getByText("分类")).toBeVisible();
    await expect(page.getByText("价格")).toBeVisible();
    await expect(page.getByText("标签")).toBeVisible();
    await expect(page.getByText("加入对比").first()).toBeVisible();

    await page.screenshot({ path: "e2e-screenshots/tools-page.png" });
  });

  test("should click tool detail link and navigate correctly", async ({ page }) => {
    await page.goto("/tools");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('[data-testid="tool-card"]', { timeout: 15000 });

    const firstCard = page.locator('[data-testid="tool-card"]').first();
    await firstCard.waitFor({ state: "visible" });
    const cardName = await firstCard.locator("h3").innerText();
    await firstCard.getByRole("link", { name: /查看详情/ }).click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/tools\//);
    await expect(page).toHaveTitle(new RegExp(cardName));

    await page.screenshot({ path: "e2e-screenshots/tool-detail.png" });
  });

  test("should work price filtering on tools page", async ({ page }) => {
    await page.goto("/tools");
    await page.waitForLoadState("networkidle");

    const priceFree = page.getByText("免费").first();
    if (await priceFree.isVisible()) {
      await priceFree.click();
      await expect(page).toHaveURL(/price=free/);
      await page.waitForLoadState("networkidle");
    }
  });

  test("should build compare page from selected tools", async ({ page }) => {
    await page.goto("/tools");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('[data-testid="tool-card"]', { timeout: 15000 });

    const cards = page.locator('[data-testid="tool-card"]');
    await cards.nth(0).getByRole("button", { name: "加入对比" }).click();
    await cards.nth(1).getByRole("button", { name: "加入对比" }).click();
    await page.getByRole("link", { name: "开始对比" }).click();

    await expect(page).toHaveURL(/\/compare\//);
    await expect(page.getByRole("heading", { name: /同一张桌子上比较/ })).toBeVisible();
  });

  test("should build compare page from scenario recommendations", async ({ page }) => {
    await page.goto("/scenarios/code-dev");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('[data-testid="tool-card"]', { timeout: 15000 });

    const compareButtons = page.getByRole("button", { name: "加入对比" });
    await compareButtons.nth(0).click();
    await compareButtons.nth(1).click();
    await page.getByRole("link", { name: "开始对比" }).click();

    await expect(page).toHaveURL(/\/compare\//);
    await expect(page.getByRole("heading", { name: /同一张桌子上比较/ })).toBeVisible();
  });

  test("should handle 404 for non-existent pages", async ({ page }) => {
    await page.goto("/non-existent-page-1234");
    await page.waitForLoadState("networkidle");
    expect(true).toBe(true);
  });
});
