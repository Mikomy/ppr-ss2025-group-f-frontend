// import { test } from '@playwright/test';
// import { StatisticsPage } from './statistics-page';
//
// test.describe('Statistics E2E Flow', () => {
//   let stats: StatisticsPage;
//
//   test.beforeEach(async ({ page }) => {
//     stats = new StatisticsPage(page);
//     await stats.goto();
//   });
//
//   test('Compute stats and show anomalies', async () => {
//     await stats.selectSensor1('device_frmpayload_data_air_humidity_value – Decentlab DL-LP8P Multisensor');
//     await stats.selectSensor2('device_frmpayload_data_air_humidity_value – Decentlab DL-LP8P Multisensor');
//     await stats.fillDateTime('17/01/2025', '00:00', '20/02/2025', '00:00');
//     await stats.compute();
//     await stats.expectStats();
//     await stats.showAnomalies();
//     await stats.expectAnomalies(1);
//   });

// test('Error when no sensor selected', async () => {
//   await stats.quickRangeLast60Days();
//   await stats.compute();
//   await stats.expectError('Für mindestens eine Gruppe wurden keine Daten im gewählten Zeitraum gefunden.');
// });
//
// test('Error when incomplete date range', async () => {
//   await stats.selectSensor1('device_frmpayload_data_air_humidity_value – Decentlab DL-LP8P Multisensor');
//   await stats.selectSensor2('device_frmpayload_data_air_humidity_value – Decentlab DL-LP8P Multisensor');// nur Datum von setzen
//   await stats.fillDateTime('17/01/2025', '', '', '');
//   await stats.compute();
//   await stats.expectError('Bitte komplettes Zeitintervall auswählen.');
// });

// test('Compute stats and no anomalies', async () => {
//   await stats.selectSensor1('device_frmpayload_data_air_humidity_value – Decentlab DL-LP8P Multisensor');
//   await stats.selectSensor2('device_frmpayload_data_air_temperature_value – Decentlab DL-LP8P Multisensor');
//   await stats.fillDateTime('01/04/2025', '00:00', '03/04/2025', '00:00');
//   await stats.compute();
//   await stats.showAnomalies();
//   await stats.expectAnomalies(0);
//   await stats.expectNoAnomaliesText();
// });
// });
