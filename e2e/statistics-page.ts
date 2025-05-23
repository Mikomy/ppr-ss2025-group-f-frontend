import { expect, Locator, Page } from '@playwright/test'

export class StatisticsPage {
  readonly page: Page
  // Navigation
  readonly linkStatistics: Locator
  // Two Sensor-Group-Selectors by accessible name
  readonly comboSensor1: Locator
  readonly comboSensor2: Locator
  // Date/Time Inputs
  readonly inputFromDate: Locator
  readonly inputFromTime: Locator
  readonly inputToDate: Locator
  readonly inputToTime: Locator
  // Compute-Button
  readonly btnCompute: Locator
  // Quick-Range-Buttons
  readonly btnLast60Days: Locator
  // Results
  readonly statsItems: Locator
  readonly anomalyRows: Locator
  readonly noAnomalyText: Locator
  readonly btnShowAnomalies: Locator
  // Error message
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.btnShowAnomalies = page.getByRole('button', { name: 'Anomalien anzeigen' })
    this.linkStatistics = page.getByRole('link', { name: 'Statistik' })
    this.comboSensor1 = page.getByRole('combobox', { name: 'Gruppe 1' })
    this.comboSensor2 = page.getByRole('combobox', { name: 'Gruppe 2' })
    this.inputFromDate = page.getByRole('textbox', { name: 'Von (Datum)' })
    this.inputFromTime = page.getByRole('textbox', { name: 'Von (Uhrzeit)' })
    this.inputToDate = page.getByRole('textbox', { name: 'Bis (Datum)' })
    this.inputToTime = page.getByRole('textbox', { name: 'Bis (Uhrzeit)' })
    this.btnLast60Days = page.getByRole('button', { name: 'Letzte 60 Tage' })
    this.btnCompute = page.getByRole('button', { name: 'Berechnen' })
    this.statsItems = page.locator('app-statistics-display mat-list-item')
    this.anomalyRows = page.locator('app-anomaly-list tr.mat-row')
    this.noAnomalyText = page.getByText('Keine Ausreißer')
    this.errorMessage = page.locator('mat-error')
  }

  async goto() {
    await this.page.goto('http://localhost:4200/')
    await this.linkStatistics.click()
    await this.page.waitForURL('**/statistics', { timeout: 15000 })
  }
  async showAnomalies() {
    await this.btnShowAnomalies.click()
  }

  async selectSensor1(option: string) {
    await this.comboSensor1.click()
    await this.page.getByRole('option', { name: option }).locator('mat-pseudo-checkbox').click()
    await this.page.keyboard.press('Escape')
  }

  async selectSensor2(option: string) {
    await this.comboSensor2.click()
    await this.page.getByRole('option', { name: option }).locator('mat-pseudo-checkbox').click()
    await this.page.keyboard.press('Escape')
  }

  async fillDateTime(fromDate: string, fromTime: string, toDate: string, toTime: string) {
    await this.inputFromDate.fill(fromDate)
    await this.inputFromTime.fill(fromTime)
    await this.inputToDate.fill(toDate)
    await this.inputToTime.fill(toTime)
  }

  async quickRangeLast60Days() {
    await this.btnLast60Days.click()
  }

  async compute() {
    await this.btnCompute.click()
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toHaveText(message)
  }

  async expectStats() {
    await this.statsItems.first().waitFor({ state: 'visible', timeout: 10000 })
    await expect(this.statsItems.first()).toBeVisible()
  }

  async expectNoAnomaliesText() {
    await expect(this.noAnomalyText).toBeVisible()
  }

  async expectAnomalies(count: number) {
    if (count > 0) {
      await this.page.waitForSelector('app-anomaly-list tr.mat-row', { timeout: 10000 })
      await expect(this.anomalyRows).toHaveCount(count)
    }
  }
}
