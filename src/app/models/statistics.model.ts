import { Measurement } from './measurement.model'

interface SensorData {
  timestamp: string
  value: number
}

export interface Statistics {
  overallTotalPointCount: number
  averageValues: Record<string, number>
  latestMeasurements: Record<string, Measurement>
  measurementPointCount: Record<string, number>
  minValues: Record<string, SensorData>
  maxValues: Record<string, SensorData>
  openAiSynopsis?: string // Optional field for OpenAI analysis
}
