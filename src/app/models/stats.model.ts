export interface DataPoint {
  timestamp: string
  value: number
}
export interface StatisticResult {
  count: number
  mean: number
  median: number
  min: number
  max: number
  variance: number
  stdDev: number
  iqr: number
  trend: number
  p25: number
  p75: number
  points: DataPoint[]
}

export interface SensorGroup {
  sensors: { measurementName: string; sensorId: string }[]
}
