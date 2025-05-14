export interface Anomaly {
  timestamp: Date
  value: number
  type: 'low' | 'high'
}
