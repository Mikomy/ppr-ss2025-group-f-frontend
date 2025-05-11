import { test, expect } from '@playwright/test'

test.describe('HomePageComponent', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('zeigt Überschrift und Subheadline an', async ({ page }) => {
    // Only check the first .sensor_headline for "Overview"
    const overviewHeadline = page.locator('.sensor_headline').first()
    await expect(overviewHeadline).toHaveText(/Overview/)
    await expect(page.locator('.sensor_subheadline')).toHaveText(/Real-time Sensor Measurements/)
  })

  test('zeigt Statistik-Kacheln an, wenn Daten vorhanden sind', async ({ page }) => {
    await expect(page.locator('.dashboard-container')).toBeVisible()
  })

  test('dashboard_error ist nicht sichtbar, DB Verbindung steht', async ({ page }) => {
    await expect(page.locator('.dashboard-container')).toBeVisible()
    await expect(page.locator('.dashboard_error')).toHaveCount(0)
  })

  test('zeigt Tabelle mit Sensordaten an', async ({ page }) => {
    await expect(page.locator('.table-container')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('thead')).toContainText(/Points|Avg|Min|Max|Latest/)
  })

  test('zeigt Min/Max Diagramm an', async ({ page }) => {
    await expect(page.locator('.diagramm-container')).toBeVisible()
    await expect(page.locator('.diagramm-container')).toContainText(/Min\/Max Werte der Sensoren/)
  })

  test('zeigt KI-Analyse an', async ({ page }) => {
    // Suche gezielt nach der stat-card mit OpenAI Synopsis
    // const kiCard = page.locator('.stat-card', { hasText: 'OpenAI Synopsis' })
    const kiCard = page.locator('#ai_synopsis')
    await expect(kiCard).toBeVisible()
  })

  test('findet Chart-Bar', async ({ page }) => {
    const firstMinBar = page.locator('.chart-bar.min').first()
    await expect(firstMinBar).toBeVisible()
  })

  test('zeigt genau 12 stat-card Elemente in der dashboard-container stats-grid', async ({
    page,
  }) => {
    const statCards = page.locator('.dashboard-container .stats-grid > .stat-card')
    await expect(statCards).toHaveCount(12)
  })
})
