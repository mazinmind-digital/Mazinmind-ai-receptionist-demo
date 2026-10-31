const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  reporter: process.env.CI ? 'list' : 'html',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  retries: process.env.CI ? 1 : 0
});
