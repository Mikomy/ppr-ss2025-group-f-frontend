import { Measurement } from './measurement.model'

export interface Statistics {
  count: number
  averageHumidity: number
  averageTemperature: number
  oldestMeasurement: Measurement
  newestMeasurement: Measurement
  lowestHumidity: Measurement
  highestHumidity: Measurement
  lowestTemperature: Measurement
  highestTemperature: Measurement
}
