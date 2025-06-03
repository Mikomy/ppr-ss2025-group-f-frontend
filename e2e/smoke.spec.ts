import { test, expect } from '@playwright/test'

test.describe('Smoke-Tests', () => {
  test('Home page loads (HTTP 200)', async ({ page }) => {
    await page.goto('http://localhost:4200/')
    const response = await page.goto('/')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)
  })

  test('TableView page loads and displays the title.', async ({ page }) => {
    const response = await page.goto('http://localhost:4200/table')
    expect(response).not.toBeNull()
    expect(response!.status()).toBe(200)
    await expect(page.locator('h1.sensor_headline')).toHaveText(/Tabellarische\s+Ansicht/)
  })
})
