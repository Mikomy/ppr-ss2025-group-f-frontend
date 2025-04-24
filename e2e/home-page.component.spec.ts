import { test, expect } from '@playwright/test'

test.describe('HomePageComponent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('zeigt Überschrift und Subheadline an', async ({ page }) => {
    await expect(page.locator('.sensor_headline')).toHaveText(/Overview/)
    await expect(page.locator('.sensor_subheadline')).toHaveText(/Real-time Sensor Measurements/)
  })

  test('zeigt Statistik-Kacheln an, wenn Daten vorhanden sind', async ({ page }) => {
    await expect(page.locator('.dashboard-container')).toBeVisible()
  })

  test('zeigt Tabelle mit Sensordaten an', async ({ page }) => {
    await expect(page.locator('.table-container')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })

  test('zeigt Dummy-Diagramm an', async ({ page }) => {
    await expect(page.locator('.diagramm-container')).toBeVisible()
    await expect(page.locator('.diagramm-container')).toContainText('Test-Diagramm')
  })

  // test('zeigt Messungen nach Standort gruppiert an', async ({ page }) => {
  //   await expect(page.locator('.home-container mat-card')).toBeVisible()
  //   await expect(page.locator('.home-container mat-card h2')).not.toHaveCount(0)
  // })
})
