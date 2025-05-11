// src/app/config/measurement-aliases.ts
export const MEASUREMENT_ALIASES: Record<string, string> = {
  'air-humidity': 'device_frmpayload_data_air_humidity_value',
  'air-temperature': 'device_frmpayload_data_air_temperature_value',
  co2: 'device_frmpayload_data_co2_concentration_value',
  'soil-moisture': 'device_frmpayload_data_soil_moisture',
  nitrogen: 'device_frmpayload_data_nitrogen',
  phosphorus: 'device_frmpayload_data_phosphorus',
  potassium: 'device_frmpayload_data_potassium',
  'senzemo-humidity': 'device_frmpayload_data_data_Humidity',
  'senzemo-soilmoisture': 'device_frmpayload_data_data_SoilMoisture',
  'senzemo-temperature': 'device_frmpayload_data_data_Temperature',
}
