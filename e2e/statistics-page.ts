import { expect, Locator, Page } from '@playwright/test'

export class StatisticsPage {
  readonly page: Page
  /** Link that navigates to the “Statistics” page. */
  readonly linkStatistics: Locator
  /** Dropdown (combobox) for selecting the first sensor group. */
  readonly comboSensor1: Locator
  /** Dropdown (combobox) for selecting the second sensor group. */
  readonly comboSensor2: Locator
  /** “Compute” button that triggers the statistics calculation. */
  readonly btnCompute: Locator
  /** “Last Week” quick-range button. */
  readonly btnLastWeek: Locator
  /** “Last Month” quick-range button. */
  readonly btnLastMonth: Locator
  /** “Last 90 Days” quick-range button. */
  readonly btnLast90Days: Locator
  /** Container element that holds the comparison table (visible when stats are ready). */
  readonly statsContainer: Locator
  /** Button to “Show Anomalies” once stats are computed. */
  readonly btnShowAnomalies: Locator
  /** Rows inside the anomaly list (one row per detected anomaly). */
  readonly anomalyRows: Locator
  /** Static text shown when no anomalies are found. */
  readonly noAnomalyText: Locator
  /** Generic error message element (mat-error). */
  readonly errorMessage: Locator

  /**
   * @param page The Playwright Page instance.
   */
  constructor(page: Page) {
    this.page = page

    // 1) Link to navigate to the Statistics page
    this.linkStatistics = page.getByRole('link', { name: 'Statistik' })

    // 2) Two sensor-group dropdowns
    this.comboSensor1 = page.getByRole('combobox', { name: 'Gruppe 1' })
    this.comboSensor2 = page.getByRole('combobox', { name: 'Gruppe 2' })

    // 3) “Compute” button (Mat-Raised-Button)
    this.btnCompute = page.getByRole('button', { name: 'Berechnen' })

    // 4) Quick-range buttons (labels must match exactly the template)
    this.btnLastWeek = page.getByRole('button', { name: 'Letzte Woche' })
    this.btnLastMonth = page.getByRole('button', { name: 'Letzter Monat' })
    this.btnLast90Days = page.getByRole('button', { name: 'Letzte 90 Tage' })

    // 5) Container for the comparison table (visible if stats are available)
    this.statsContainer = page.locator('.comparison-card')

    // 6) “Show Anomalies” button, anomaly rows, and “no anomalies” text
    this.btnShowAnomalies = page.getByRole('button', { name: 'Anomalien anzeigen' })
    this.anomalyRows = page.locator('app-anomaly-list tr.mat-row')
    this.noAnomalyText = page.getByText('Keine Ausreißer')

    // 7) Generic error text (mat-error)
    this.errorMessage = page.locator('mat-error')
  }

  /**
   * Navigate to the home page and click the “Statistik” link,
   * then wait until the URL contains “/statistics”.
   */
  async goto() {
    await this.page.goto('http://localhost:4200/')
    await this.linkStatistics.click()
    await this.page.waitForURL('**/statistics', { timeout: 15_000 })
  }

  /**
   * Select an option from the first sensor-group dropdown.
   * @param option The visible label of the option to pick.
   */
  async selectSensor1(option: string) {
    await this.comboSensor1.click()
    await this.page.getByRole('option', { name: option }).locator('mat-pseudo-checkbox').click()
    // Press Escape to close the dropdown
    await this.page.keyboard.press('Escape')
  }

  /**
   * Select an option from the second sensor-group dropdown.
   * @param option The visible label of the option to pick.
   */
  async selectSensor2(option: string) {
    await this.comboSensor2.click()
    await this.page.getByRole('option', { name: option }).locator('mat-pseudo-checkbox').click()
    // Press Escape to close the dropdown
    await this.page.keyboard.press('Escape')
  }

  /**
   * Click the “Compute” button to trigger the statistics request.
   */
  async compute() {
    await this.btnCompute.click()
  }

  /**
   * Click the “Last 90 Days” quick-range button.
   * In the component, applyQuick() will patch the form and immediately call onCompute().
   */
  async quickRangeLast90Days() {
    await this.btnLast90Days.click()
  }

  /**
   * Click the “Last Week” quick-range button.
   * In the component, applyQuick() will patch the form and immediately call onCompute().
   */
  async quickRangeLastWeek() {
    await this.btnLastWeek.click()
  }

  /**
   * Click the “Last Month” quick-range button.
   * In the component, applyQuick() will patch the form and immediately call onCompute().
   */
  async quickRangeLastMonth() {
    await this.btnLastMonth.click()
  }

  /**
   * Assert that the mat-error element’s text matches the expected message.
   * @param message The exact text to expect in mat-error.
   */
  async expectError(message: string) {
    await expect(this.errorMessage).toHaveText(message)
  }

  /**
   * Wait until the comparison table (statsContainer) is visible on screen.
   * If it never appears within the timeout, this call will throw.
   */
  async expectStats() {
    await this.statsContainer.waitFor({ state: 'visible', timeout: 10_000 })
    await expect(this.statsContainer).toBeVisible()
  }

  /**
   * Read how many anomaly rows are currently rendered.
   * @returns The number of <tr.mat-row> inside <app-anomaly-list>.
   */
  async getAnomalyCount(): Promise<number> {
    return await this.anomalyRows.count()
  }

  /**
   * Click the “Show Anomalies” button.
   */
  async showAnomalies() {
    // Wait up to 5s for the button to be visible and enabled
    await this.btnShowAnomalies.waitFor({ state: 'visible', timeout: 5_000 })
    await this.btnShowAnomalies.click()
  }

  /**
   * Assert that exactly `count` anomaly rows are visible.
   * @param count Expected number of <app-anomaly-list> rows.
   */
  async expectAnomalies(count: number) {
    if (count > 0) {
      await this.page.waitForSelector('app-anomaly-list tr.mat-row', { timeout: 10_000 })
      await expect(this.anomalyRows).toHaveCount(count)
    }
  }

  /**
   * Assert that the “Keine Ausreißer” text is visible.
   */
  async expectNoAnomaliesText() {
    await expect(this.noAnomalyText).toBeVisible()
  }
}
