const { test } = require('@playwright/test');

test('test page', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  const response = await page.goto('http://localhost:3000/course/l1/paper-cutting', { waitUntil: 'networkidle' });
  console.log('Status:', response.status());
  console.log('Title:', await page.title());
});
