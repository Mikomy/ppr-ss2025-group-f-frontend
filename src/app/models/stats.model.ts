import { ScatterDataPoint } from 'chart.js'

export interface DataPoint {
  timestamp: string
  value: number
}
export interface ScatterPoint {
  x: number // timestamp in ms
  y: number
}
export interface Series {
  measurementName: string
  sensorName: string
  points: ScatterDataPoint[]
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
  series: Series[]
}

export interface SensorGroup {
  sensors: {
    alias: string
    measurementName: string
    sensorName: string
  }[]
}
