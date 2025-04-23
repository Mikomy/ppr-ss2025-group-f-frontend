// A simple health check status.
export const fakeData = 'Service is running'

// ------------------------------
// Decentlab Measurements
// ------------------------------

// Air Humidity (%)
export const fakeAirHumidity = [
  {
    measurementName: 'device_frmpayload_data_air_humidity_value',
    sensor: {
      name: 'Decentlab DL-LP8P Multisensor',
      id: 'decentlab-dl-lp8p',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-01-02T09:00:00Z', value: 42.3 },
      { timestamp: '2025-02-03T10:00:00Z', value: 44.1 },
      { timestamp: '2025-03-03T11:00:00Z', value: 45.7 },
      { timestamp: '2025-04-03T12:00:00Z', value: 47.2 },
      { timestamp: '2025-04-03T13:00:00Z', value: 46.5 },
    ],
  },
]

// Air Temperature (°C)
export const fakeAirTemperature = [
  {
    measurementName: 'device_frmpayload_data_air_temperature_value',
    sensor: {
      name: 'Decentlab DL-LP8P Multisensor',
      id: 'decentlab-dl-lp8p',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 14.2 },
      { timestamp: '2025-04-03T10:00:00Z', value: 17.0 },
      { timestamp: '2025-04-03T11:00:00Z', value: 18.4 },
      { timestamp: '2025-04-03T12:00:00Z', value: 30.1 },
      { timestamp: '2025-04-03T13:00:00Z', value: 20.0 },
    ],
  },
]

// CO2 Concentration (ppm)
export const fakeCO2Concentration = [
  {
    measurementName: 'device_frmpayload_data_co2_concentration_value',
    sensor: {
      name: 'Decentlab DL-LP8P Multisensor',
      id: 'decentlab-dl-lp8p',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 412 },
      { timestamp: '2025-04-03T10:00:00Z', value: 420 },
      { timestamp: '2025-04-03T11:00:00Z', value: 430 },
      { timestamp: '2025-04-03T12:00:00Z', value: 425 },
      { timestamp: '2025-04-03T13:00:00Z', value: 418 },
    ],
  },
]

// ------------------------------
// Milesight Measurements (Soil Moisture)
// ------------------------------

export const fakeSoilMoisture = [
  {
    measurementName: 'device_frmpayload_data_soil_moisture',
    sensor: {
      name: 'Milesight EM500 Bodenfeuchtesensor 1',
      id: 'milesight-em500-1',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 23.5 },
      { timestamp: '2025-04-03T10:00:00Z', value: 24.2 },
      { timestamp: '2025-04-03T11:00:00Z', value: 25.1 },
      { timestamp: '2025-04-03T12:00:00Z', value: 24.8 },
      { timestamp: '2025-04-03T13:00:00Z', value: 25.6 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_soil_moisture',
    sensor: {
      name: 'Milesight EM500 Bodenfeuchtesensor 2',
      id: 'milesight-em500-2',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 28.1 },
      { timestamp: '2025-04-03T10:00:00Z', value: 27.5 },
      { timestamp: '2025-04-03T11:00:00Z', value: 26.9 },
      { timestamp: '2025-04-03T12:00:00Z', value: 27.3 },
      { timestamp: '2025-04-03T13:00:00Z', value: 28.0 },
    ],
  },
]

// ------------------------------
// Netvox Measurements
// ------------------------------

// Nitrogen (mg/kg)
export const fakeNitrogen = [
  {
    measurementName: 'device_frmpayload_data_nitrogen',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 1',
      id: 'netvox-r72632a-npk-1',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 8.2 },
      { timestamp: '2025-04-03T10:00:00Z', value: 8.5 },
      { timestamp: '2025-04-03T11:00:00Z', value: 8.8 },
      { timestamp: '2025-04-03T12:00:00Z', value: 9.0 },
      { timestamp: '2025-04-03T13:00:00Z', value: 8.7 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_nitrogen',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 2',
      id: 'netvox-r72632a-npk-2',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 7.5 },
      { timestamp: '2025-04-03T10:00:00Z', value: 7.8 },
      { timestamp: '2025-04-03T11:00:00Z', value: 8.0 },
      { timestamp: '2025-04-03T12:00:00Z', value: 8.3 },
      { timestamp: '2025-04-03T13:00:00Z', value: 8.1 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_nitrogen',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 3',
      id: 'netvox-r72632a-npk-3',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 9.1 },
      { timestamp: '2025-04-03T10:00:00Z', value: 9.3 },
      { timestamp: '2025-04-03T11:00:00Z', value: 9.5 },
      { timestamp: '2025-04-03T12:00:00Z', value: 9.2 },
      { timestamp: '2025-04-03T13:00:00Z', value: 9.0 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_nitrogen',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 4',
      id: 'netvox-r72632a-npk-4',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 7.9 },
      { timestamp: '2025-04-03T10:00:00Z', value: 8.0 },
      { timestamp: '2025-04-03T11:00:00Z', value: 8.2 },
      { timestamp: '2025-04-03T12:00:00Z', value: 8.5 },
      { timestamp: '2025-04-03T13:00:00Z', value: 8.3 },
    ],
  },
]

// Phosphorus (mg/kg)
export const fakePhosphorus = [
  {
    measurementName: 'device_frmpayload_data_phosphorus',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 1',
      id: 'netvox-r72632a-npk-1',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 1.2 },
      { timestamp: '2025-04-03T10:00:00Z', value: 1.3 },
      { timestamp: '2025-04-03T11:00:00Z', value: 1.5 },
      { timestamp: '2025-04-03T12:00:00Z', value: 1.4 },
      { timestamp: '2025-04-03T13:00:00Z', value: 1.6 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_phosphorus',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 2',
      id: 'netvox-r72632a-npk-2',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 1.4 },
      { timestamp: '2025-04-03T10:00:00Z', value: 1.5 },
      { timestamp: '2025-04-03T11:00:00Z', value: 1.7 },
      { timestamp: '2025-04-03T12:00:00Z', value: 1.6 },
      { timestamp: '2025-04-03T13:00:00Z', value: 1.8 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_phosphorus',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 3',
      id: 'netvox-r72632a-npk-3',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 1.1 },
      { timestamp: '2025-04-03T10:00:00Z', value: 1.2 },
      { timestamp: '2025-04-03T11:00:00Z', value: 1.3 },
      { timestamp: '2025-04-03T12:00:00Z', value: 1.5 },
      { timestamp: '2025-04-03T13:00:00Z', value: 1.4 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_phosphorus',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 4',
      id: 'netvox-r72632a-npk-4',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 1.6 },
      { timestamp: '2025-04-03T10:00:00Z', value: 1.7 },
      { timestamp: '2025-04-03T11:00:00Z', value: 1.8 },
      { timestamp: '2025-04-03T12:00:00Z', value: 1.9 },
      { timestamp: '2025-04-03T13:00:00Z', value: 2.0 },
    ],
  },
]

// Potassium (mg/kg)
export const fakePotassium = [
  {
    measurementName: 'device_frmpayload_data_potassium',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 1',
      id: 'netvox-r72632a-npk-1',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 4.2 },
      { timestamp: '2025-04-03T10:00:00Z', value: 4.5 },
      { timestamp: '2025-04-03T11:00:00Z', value: 4.8 },
      { timestamp: '2025-04-03T12:00:00Z', value: 4.6 },
      { timestamp: '2025-04-03T13:00:00Z', value: 4.7 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_potassium',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 2',
      id: 'netvox-r72632a-npk-2',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 5.0 },
      { timestamp: '2025-04-03T10:00:00Z', value: 5.2 },
      { timestamp: '2025-04-03T11:00:00Z', value: 5.5 },
      { timestamp: '2025-04-03T12:00:00Z', value: 5.3 },
      { timestamp: '2025-04-03T13:00:00Z', value: 5.1 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_potassium',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 3',
      id: 'netvox-r72632a-npk-3',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 4.8 },
      { timestamp: '2025-04-03T10:00:00Z', value: 4.9 },
      { timestamp: '2025-04-03T11:00:00Z', value: 5.1 },
      { timestamp: '2025-04-03T12:00:00Z', value: 5.0 },
      { timestamp: '2025-04-03T13:00:00Z', value: 4.7 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_potassium',
    sensor: {
      name: 'Netvox R72632A NPK-Sensor 4',
      id: 'netvox-r72632a-npk-4',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 5.3 },
      { timestamp: '2025-04-03T10:00:00Z', value: 5.5 },
      { timestamp: '2025-04-03T11:00:00Z', value: 5.4 },
      { timestamp: '2025-04-03T12:00:00Z', value: 5.6 },
      { timestamp: '2025-04-03T13:00:00Z', value: 5.2 },
    ],
  },
]

// ------------------------------
// Senzemo Senstick Measurements
// ------------------------------

// Data Humidity (%)
export const fakeDataHumidity = [
  {
    measurementName: 'device_frmpayload_data_data_Humidity',
    sensor: {
      name: 'Senzemo Senstick Bodenfeuchtesensor 1',
      id: 'senzemo-senstick-1',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 52.1 },
      { timestamp: '2025-04-03T10:00:00Z', value: 51.3 },
      { timestamp: '2025-04-03T11:00:00Z', value: 50.8 },
      { timestamp: '2025-04-03T12:00:00Z', value: 52.5 },
      { timestamp: '2025-04-03T13:00:00Z', value: 53.0 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_data_Humidity',
    sensor: {
      name: 'Senzemo Senstick Bodenfeuchtesensor 3',
      id: 'senzemo-senstick-3',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 48.7 },
      { timestamp: '2025-04-03T10:00:00Z', value: 49.1 },
      { timestamp: '2025-04-03T11:00:00Z', value: 47.9 },
      { timestamp: '2025-04-03T12:00:00Z', value: 48.3 },
      { timestamp: '2025-04-03T13:00:00Z', value: 49.0 },
    ],
  },
]

// Data SoilMoisture (%)
export const fakeDataSoilMoisture = [
  {
    measurementName: 'device_frmpayload_data_data_SoilMoisture',
    sensor: {
      name: 'Senzemo Senstick Bodenfeuchtesensor 1',
      id: 'senzemo-senstick-1',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 28.2 },
      { timestamp: '2025-04-03T10:00:00Z', value: 27.9 },
      { timestamp: '2025-04-03T11:00:00Z', value: 28.5 },
      { timestamp: '2025-04-03T12:00:00Z', value: 29.0 },
      { timestamp: '2025-04-03T13:00:00Z', value: 28.7 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_data_SoilMoisture',
    sensor: {
      name: 'Senzemo Senstick Bodenfeuchtesensor 3',
      id: 'senzemo-senstick-3',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 31.1 },
      { timestamp: '2025-04-03T10:00:00Z', value: 30.8 },
      { timestamp: '2025-04-03T11:00:00Z', value: 31.3 },
      { timestamp: '2025-04-03T12:00:00Z', value: 31.5 },
      { timestamp: '2025-04-03T13:00:00Z', value: 31.0 },
    ],
  },
]

// Data Temperature (°C)
export const fakeDataTemperature = [
  {
    measurementName: 'device_frmpayload_data_data_Temperature',
    sensor: {
      name: 'Senzemo Senstick Bodenfeuchtesensor 1',
      id: 'senzemo-senstick-1',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 15.2 },
      { timestamp: '2025-04-03T10:00:00Z', value: 15.5 },
      { timestamp: '2025-04-03T11:00:00Z', value: 15.8 },
      { timestamp: '2025-04-03T12:00:00Z', value: 16.0 },
      { timestamp: '2025-04-03T13:00:00Z', value: 16.3 },
    ],
  },
  {
    measurementName: 'device_frmpayload_data_data_Temperature',
    sensor: {
      name: 'Senzemo Senstick Bodenfeuchtesensor 3',
      id: 'senzemo-senstick-3',
      location: 'Nexus',
    },
    dataPoints: [
      { timestamp: '2025-04-03T09:00:00Z', value: 14.8 },
      { timestamp: '2025-04-03T10:00:00Z', value: 15.0 },
      { timestamp: '2025-04-03T11:00:00Z', value: 15.3 },
      { timestamp: '2025-04-03T12:00:00Z', value: 15.6 },
      { timestamp: '2025-04-03T13:00:00Z', value: 15.9 },
    ],
  },
]
