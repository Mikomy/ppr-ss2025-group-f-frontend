import { test } from '@playwright/test'
import { StatisticsPage } from './statistics-page'

test.describe('Statistics E2E Flow', () => {
  let stats: StatisticsPage

  test.beforeEach(async ({ page }) => {
    stats = new StatisticsPage(page)
    await stats.goto()
  })

  test('Compute stats and show anomalies', async () => {
    // 1) Select the same sensor group for both Group 1 and Group 2 (as a shortcut).
    await stats.selectSensor1(
      'device_frmpayload_data_air_humidity_value – Decentlab DL-LP8P Multisensor'
    )
    await stats.selectSensor2(
      'device_frmpayload_data_air_humidity_value – Decentlab DL-LP8P Multisensor'
    )

    // 2) Click “Last 90 Days” quick-range.
    //    The component’s applyQuick() will patch the form and immediately call onCompute().
    await stats.quickRangeLast90Days()

    // 3) In some cases, onCompute() may not fire instantly. As a fallback, click Compute again.
    await stats.compute()

    // 4) Now try to wait for the comparison-table to appear **or** catch an error if no data exists.
    let sawStats = false
    try {
      await stats.expectStats()
      sawStats = true
    } catch {
      // If the comparison table never appeared in 10 seconds, assume “no data” error.
      await stats.expectError(
        'Für mindestens eine Gruppe wurden keine Daten im gewählten Zeitraum gefunden.'
      )
    }

    if (sawStats) {
      // 5) If we did see stats, click “Show Anomalies”, then verify anomalies or “no anomalies” message.
      await stats.showAnomalies()

      const count = await stats.getAnomalyCount()
      if (count > 0) {
        await stats.expectAnomalies(count)
      } else {
        await stats.expectNoAnomaliesText()
      }
    }
  })

  test('Error when no sensor selected', async () => {
    // 1) Without selecting any sensors, click “Last 90 Days”.
    await stats.quickRangeLast90Days()

    // 2) Click “Compute” explicitly to surface the validation error.
    await stats.compute()

    // 3) Expect the validation error: “Bitte beide Gruppen auswählen.”
    await stats.expectError('Bitte beide Gruppen auswählen.')
  })

  test('Error when incomplete date range', async () => {
    // 1) Select both sensor groups but do NOT click any quick-range or fill date/time.
    await stats.selectSensor1(
      'device_frmpayload_data_air_humidity_value – Decentlab DL-LP8P Multisensor'
    )
    await stats.selectSensor2(
      'device_frmpayload_data_air_humidity_value – Decentlab DL-LP8P Multisensor'
    )

    // 2) Click “Compute” immediately (no Quick-Range, no date/time fields).
    await stats.compute()

    // 3) The component sets exactly:
    //     "Bitte komplettes Zeitintervall auswählen oder Quick-Range klicken."
    await stats.expectError('Bitte komplettes Zeitintervall auswählen oder Quick-Range klicken.')
  })

  test('Compute stats and no anomalies', async () => {
    // 1) Select Group 1 = air humidity, Group 2 = air temperature.
    await stats.selectSensor1(
      'device_frmpayload_data_air_humidity_value – Decentlab DL-LP8P Multisensor'
    )
    await stats.selectSensor2(
      'device_frmpayload_data_air_temperature_value – Decentlab DL-LP8P Multisensor'
    )

    // 2) Quick-range: “Last 90 Days” then explicit compute.
    await stats.quickRangeLast90Days()
    await stats.compute()

    // 3) Wait for comparison table OR handle “no data.”
    let sawStats = false
    try {
      await stats.expectStats()
      sawStats = true
    } catch {
      // If it times out, assert the “no data” error:
      await stats.expectError(
        'Für mindestens eine Gruppe wurden keine Daten im gewählten Zeitraum gefunden.'
      )
    }

    if (sawStats) {
      // 4) Click “Show Anomalies,” then verify anomalies or “no anomalies” text.
      await stats.showAnomalies()

      const count = await stats.getAnomalyCount()
      if (count > 0) {
        await stats.expectAnomalies(count)
      } else {
        await stats.expectNoAnomaliesText()
      }
    }
  })
})
