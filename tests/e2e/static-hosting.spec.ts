import { expect, test, type Page } from "@playwright/test";

function collectHostingFailures(page: Page): string[] {
  const failures: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push(`console: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    failures.push(`page: ${error.message}`);
  });
  page.on("requestfailed", (request) => {
    failures.push(
      `request: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? "unknown"}`,
    );
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      failures.push(`response: ${String(response.status())} ${response.url()}`);
    }
  });

  return failures;
}

test("boots the compiled game at its configured static-host path", async ({
  page,
}, testInfo) => {
  const failures = collectHostingFailures(page);

  await page.goto("./");
  await expect(
    page.getByRole("heading", { level: 1, name: "Sandstrike" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Start vertical slice" }).click();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.getByRole("status")).toContainText("Movement preview ready");

  const hasTestBridge = await page.evaluate(() =>
    Object.prototype.hasOwnProperty.call(window, "__SANDSTRIKE_TEST__"),
  );
  expect(hasTestBridge).toBe(testInfo.project.metadata.buildKind === "e2e");

  expect(failures).toEqual([]);
});
