const { defineConfig, devices } = require("@playwright/test")
const path = require("node:path")

const web = path.resolve(__dirname, "../..")
const backend = path.resolve(web, "../school-manage")
module.exports = defineConfig({
  testDir: __dirname,
  testMatch: "*.spec.cjs",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  forbidOnly: true,
  reporter: [["list"], ["html", { outputFolder: "../../.qa-artifacts/playwright-report", open: "never" }]],
  outputDir: "../../.qa-artifacts/browser-results",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "make qa-server PYTHON=.venv/bin/python",
      cwd: backend,
      url: "http://127.0.0.1:8100/health",
      timeout: 60_000,
      reuseExistingServer: false,
    },
    {
      command: "pnpm dev --hostname 127.0.0.1 --port 3100",
      cwd: web,
      env: { API_URL: "http://127.0.0.1:8100/api/v1" },
      url: "http://127.0.0.1:3100/login",
      timeout: 60_000,
      reuseExistingServer: false,
    },
  ],
})
