const { test, expect } = require('@playwright/test');

test('screenshot interaction', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1024 });
  await page.goto('http://localhost:3000/course/l1/paper-cutting', { waitUntil: 'networkidle' });

  await page.waitForSelector('canvas');
  await page.waitForTimeout(2000);

  // Get canvas bounding box
  const canvas = await page.locator('canvas');
  const box = await canvas.boundingBox();

  // Draw a path to cut the wedge (e.g., cut out a triangle from the edge)
  // The wedge is centered at (400, 400), radius 300. So it goes from 400 to 700 on X axis.
  // Let's cut at (600, 400), (600, 450), (650, 450) relative to canvas center
  await page.mouse.move(box.x + 600, box.y + 400);
  await page.mouse.down();
  await page.mouse.move(box.x + 550, box.y + 380);
  await page.mouse.move(box.x + 580, box.y + 360);
  await page.mouse.move(box.x + 600, box.y + 400);
  await page.mouse.up();

  await page.waitForTimeout(1000);

  await page.screenshot({ path: '/home/jules/verification/test-cut.png' });

  // Click Unfold
  await page.click('text=展开 (Unfold)');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: '/home/jules/verification/test-unfold.png' });
});
