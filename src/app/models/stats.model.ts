export interface StatisticResult {
  mean: number
  min: number
  max: number
  stdDev: number
  trend: number
}

export interface SensorGroup {
  sensors: { measurementName: string; sensorId: string }[]
}
