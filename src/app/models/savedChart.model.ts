export interface SavedChart {
  id: string
  titles: string[]
  from: string
  to: string
  series: {
    label: string
    data: { timestamp: string; value: number }[]
    color: string
  }[]
  chartType: 'line' | 'bar' | 'heatmap'
}
