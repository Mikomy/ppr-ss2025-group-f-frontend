export interface SavedChart {
  id: string
  titles: string[]
  label: string[]
  series: {
    label: string
    data: { timestamp: string; value: number }[]
    color: string
  }[]
  chartType: 'line' | 'bar' | 'heatmap'
}
