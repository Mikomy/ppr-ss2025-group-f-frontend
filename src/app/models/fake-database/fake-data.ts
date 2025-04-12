// A simple health check status.
export const fakeData = 'Service is running'

// Soil Moisture measurement data.
export const fakeSoilMoisture = {
  measurementName: 'Soil Moisture',
  sensor: {
    name: 'Senzemo_Senstick_Bodenfeuchtesensor_1',
    id: '00137a1000045594',
    location: 'Nexus',
  },
  dataPoints: [
    { timestamp: '2025-03-29T23:20:00Z', value: 29 },
    { timestamp: '2025-03-29T23:00:00Z', value: 29 },
    { timestamp: '2025-03-29T22:40:00Z', value: 28 },
  ],
}

// Phosphorus measurement data.
export const fakePhosphorus = {
  measurementName: 'Phosphorus',
  sensor: {
    name: 'Senzemo_Senstick_Phosphor_1',
    id: '00137a1000045593',
    location: 'Nexus',
  },
  dataPoints: [
    { timestamp: '2025-03-29T23:20:00Z', value: 1 },
    { timestamp: '2025-03-29T23:00:00Z', value: 1 },
    { timestamp: '2025-03-29T22:40:00Z', value: 1 },
  ],
}

// Nitrogen measurement data.
export const fakeNitrogen = {
  measurementName: 'Nitrogen',
  sensor: {
    name: 'Senzemo_Senstick_Stickstoff_1',
    id: '00137a1000045592',
    location: 'Nexus',
  },
  dataPoints: [
    { timestamp: '2025-03-29T23:20:00Z', value: 1 },
    { timestamp: '2025-03-29T23:00:00Z', value: 1 },
    { timestamp: '2025-03-29T22:40:00Z', value: 1 },
  ],
}

// Humidity measurement data.
export const fakeHumidity = {
  measurementName: 'Humidity',
  sensor: {
    name: 'Senzemo_Senstick_Luftfeuchtesensor_1',
    id: '00137a1000045591',
    location: 'Nexus',
  },
  dataPoints: [
    { timestamp: '2025-03-29T23:20:00Z', value: 45.3 },
    { timestamp: '2025-03-29T23:00:00Z', value: 44.8 },
    { timestamp: '2025-03-29T22:40:00Z', value: 44.3 },
  ],
}

// Room Temperature measurement data.
export const fakeRoomTemperature = {
  measurementName: 'Room Temperature',
  sensor: {
    name: 'Senzemo_Senstick_Raumtemperatursensor_1',
    id: '00137a1000045590',
    location: 'Nexus',
  },
  dataPoints: [
    { timestamp: '2025-03-29T23:20:00Z', value: 21.5 },
    { timestamp: '2025-03-29T23:00:00Z', value: 21.3 },
    { timestamp: '2025-03-29T22:40:00Z', value: 21.0 },
  ],
}
