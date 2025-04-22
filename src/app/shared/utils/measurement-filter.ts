import { Measurement } from '../../models/measurement.model'

/**
 * Filters an array of measurements for exactly that sensor name.
 */
export function filterBySensor(
  measurements: Measurement[],
  sensorName: string
): Measurement | undefined {
  return measurements.find((m) => m.sensor.name === sensorName)
}
