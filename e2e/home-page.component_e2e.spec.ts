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

  test.describe('Filtered View', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(
        '/?sensorName=Netvox%20R72632A%20NPK-Sensor%202&measurementName=device_frmpayload_data_nitrogen'
      )
    })

    test('zeigt gefilterte Ansicht Überschrift an', async ({ page }) => {
      // Use first() to specifically target the first heading
      await expect(page.locator('.sensor_headline').first()).toContainText('Stickstoff')
      await expect(page.locator('.sensor_subheadline')).toContainText('Netvox R72632A NPK-Sensor 2')
    })

    test('zeigt korrekte gefilterte Statistik-Karten an', async ({ page }) => {
      const statCards = page.locator('.dashboard-container .stats-grid > .stat-card')
      await expect(statCards).toHaveCount(6) // Gefilterte Ansicht zeigt 6 Karten an

      // Überprüfen auf spezifische Karten in der gefilterten Ansicht
      await expect(page.locator('.stat-card:has-text("Anzahl Messungen")')).toBeVisible()
      await expect(page.locator('.stat-card:has-text("Durchschnittswert")')).toBeVisible()
      await expect(page.locator('.stat-card:has-text("Letzter Wert")')).toBeVisible()
      await expect(page.locator('.stat-card:has-text("Minimum")')).toBeVisible()
      await expect(page.locator('.stat-card:has-text("Maximum")')).toBeVisible()
    })

    test('Filter zurücksetzen Button funktioniert', async ({ page }) => {
      const resetButton = page.locator('button:has-text("Filter zurücksetzen")')
      await expect(resetButton).toBeVisible()

      await resetButton.click()

      // Überprüfen, ob die URL-Parameter gelöscht wurden
      await expect(page).toHaveURL('/')

      // Überprüfen, ob die Ansicht auf ungefiltert zurückgeschaltet wurde
      const statCards = page.locator('.dashboard-container .stats-grid > .stat-card')
      await expect(statCards).toHaveCount(12) // Ungefilterte Ansicht zeigt 12 Karten an
    })

    test('zeigt Ladezustand während der OpenAI-Analyse an', async ({ page }) => {
      // Neue Analyse auslösen durch Ändern des Filters
      const filterSelect = page.locator('#sensor_select_dashboard')
      await filterSelect.selectOption({ index: 1 }) // Anderen Sensor auswählen

      // Überprüfen der Ladeanzeige
      await expect(page.locator('#ai_synopsis')).toContainText('Lade neue Synopsis...')
    })
  })
})
