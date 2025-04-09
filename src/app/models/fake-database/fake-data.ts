// A simple health check status.
export const fakeData = 'Service is running';

// Soil Moisture measurement data.
export const fakeSoilMoisture = {
  measurementName: 'Soil Moisture',
  sensor: {
    name: 'Senzemo_Senstick_Bodenfeuchtesensor_1',
    type: 'Bodenfeuchte',
    location: '',
  },
  dataPoints: [
    { timestamp: '2025-03-29T23:20:00Z', value: 29 },
    { timestamp: '2025-03-29T23:00:00Z', value: 29 },
    { timestamp: '2025-03-29T22:40:00Z', value: 28 },
  ],
};

// Phosphorus measurement data.
export const fakePhosphorus = {
  measurementName: 'Phosphorus',
  sensor: {
    name: 'Senzemo_Senstick_Phosphor_1',
    type: 'Phosphorus',
    location: 'Beet 1',
  },
  dataPoints: [
    { timestamp: '2025-03-29T23:20:00Z', value: 1 },
    { timestamp: '2025-03-29T23:00:00Z', value: 1 },
    { timestamp: '2025-03-29T22:40:00Z', value: 1 },
  ],
};

// Nitrogen measurement data.
export const fakeNitrogen = {
  measurementName: 'Nitrogen',
  sensor: {
    name: 'Senzemo_Senstick_Stickstoff_1',
    type: 'Stickstoff',
    location: 'Beet 1',
  },
  dataPoints: [
    { timestamp: '2025-03-29T23:20:00Z', value: 1 },
    { timestamp: '2025-03-29T23:00:00Z', value: 1 },
    { timestamp: '2025-03-29T22:40:00Z', value: 1 },
  ],
};

// Humidity measurement data.
export const fakeHumidity = {
  measurementName: 'Humidity',
  sensor: {
    name: 'Senzemo_Senstick_Luftfeuchtesensor_1',
    type: 'Luftfeuchte',
    location: 'Beet 1',
  },
  dataPoints: [
    { timestamp: '2025-03-29T23:20:00Z', value: 45.3 },
    { timestamp: '2025-03-29T23:00:00Z', value: 44.8 },
    { timestamp: '2025-03-29T22:40:00Z', value: 44.3 },
  ],
};

// Room Temperature measurement data.
export const fakeRoomTemperature = {
  measurementName: 'Room Temperature',
  sensor: {
    name: 'Senzemo_Senstick_Raumtemperatursensor_1',
    type: 'Temperature',
    location: 'Beet 1',
  },
  dataPoints: [
    { timestamp: '2025-03-29T23:20:00Z', value: 21.5 },
    { timestamp: '2025-03-29T23:00:00Z', value: 21.3 },
    { timestamp: '2025-03-29T22:40:00Z', value: 21.0 },
  ],
};
