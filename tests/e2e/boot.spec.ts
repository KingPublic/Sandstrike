import { expect, test, type Page } from "@playwright/test";

function collectBrowserFailures(page: Page): string[] {
  const failures: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      failures.push(`console: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
  page.on("requestfailed", (request) => {
    failures.push(
      `request: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? "unknown"}`,
    );
  });

  return failures;
}

test("boots one accessible Phaser canvas and preserves it across pause/resume", async ({
  page,
}) => {
  const failures = collectBrowserFailures(page);

  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Sandstrike" }),
  ).toBeVisible();
  const start = page.getByRole("button", { name: "Start vertical slice" });
  await expect(start).toBeFocused();

  await start.click();
  await expect(page.getByRole("status")).toContainText("Preparing the arena");
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.getByRole("status")).toContainText("Movement preview ready");
  await expect(page.locator("canvas")).toBeFocused();

  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Resume movement" }).click();
  await expect(page.locator("canvas")).toHaveCount(1);
  expect(failures).toEqual([]);
});

test("recovers from an injected boot failure without leaking a canvas", async ({
  page,
}) => {
  const failures = collectBrowserFailures(page);

  await page.goto("/?e2eBootFailure=1");
  await page.getByRole("button", { name: "Start vertical slice" }).click();

  await expect(page.getByRole("alert")).toContainText(
    "The movement preview could not start",
  );
  await expect(page.locator("canvas")).toHaveCount(0);
  const retry = page.getByRole("button", { name: "Retry preview" });
  await expect(retry).toBeFocused();

  await retry.click();
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.getByRole("status")).toContainText("Movement preview ready");
  expect(failures).toEqual([]);
});
