const { test } = require('@playwright/test');

test('screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1024 });
  await page.goto('http://localhost:3000/course/l1/paper-cutting', { waitUntil: 'networkidle' });

  // Wait for canvas to be ready
  await page.waitForSelector('canvas');
  await page.waitForTimeout(2000); // Give paper.js time to render

  await page.screenshot({ path: '/home/jules/verification/test-canvas.png', fullPage: true });
});
