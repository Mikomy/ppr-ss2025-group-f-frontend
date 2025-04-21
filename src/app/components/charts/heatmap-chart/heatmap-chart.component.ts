import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgxEchartsModule } from 'ngx-echarts'
import * as echarts from 'echarts'

export interface Zone {
  start: number
  end: number
  color: string
}

export const DEFAULT_TEMPERATURE_ZONES: Zone[] = [
  { start: -50, end: 0, color: '#4575b4' }, // Kalt
  { start: 0, end: 15, color: '#91bfdb' }, // Kühl
  { start: 15, end: 25, color: '#fee090' }, // Mild
  { start: 25, end: 35, color: '#fc8d59' }, // Warm
  { start: 35, end: 60, color: '#d73027' }, // Heiß
]

/**
 * Heatmap-Chart-Komponente: stellt mehrere Messreihen als Heatmap dar (Reihen=Messungen, Spalten=Zeitpunkte).
 * https://xieziyu.github.io/ngx-echarts/#/series/heatmap
 */
@Component({
  selector: 'app-heatmap-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './heatmap-chart.component.html',
  styleUrls: ['./heatmap-chart.component.scss'],
})
export class HeatmapChartComponent implements OnChanges {
  @Input() dataSeries: {
    label: string
    data: { timestamp: string; value: number }[]
    color: string
  }[] = []
  @Input() zones: Zone[] = []
  public chartOption: echarts.EChartsOption = {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSeries']) {
      this.updateHeatmap()
    }
  }

  private updateHeatmap(): void {
    const usedZones = this.zones.length > 0 ? this.zones : DEFAULT_TEMPERATURE_ZONES
    const labels = this.dataSeries[0]?.data.map((pt) => pt.timestamp) || []
    const yLabels = this.dataSeries.map((s) => s.label)

    // Flatten data: [xIndex, yIndex, value]
    const heatData: [number, number, number][] = []
    this.dataSeries.forEach((s, i) => {
      s.data.forEach((pt, j) => {
        heatData.push([j, i, pt.value])
      })
    })

    this.chartOption = {
      tooltip: { position: 'top' },
      grid: { height: '70%', top: '10%' },
      xAxis: [{ type: 'category', data: labels, name: 'Zeit' }],
      yAxis: [{ type: 'category', data: yLabels, name: 'Messung' }],
      visualMap: {
        type: 'piecewise',
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        pieces: usedZones.map((z) => ({
          gt: z.start,
          lt: z.end,
          color: z.color,
        })),
      },
      series: [
        {
          name: 'Messwerte',
          type: 'heatmap',
          data: heatData,
          label: { show: false },
          emphasis: { itemStyle: { borderColor: '#333', borderWidth: 1 } },
        },
      ],
    }
  }
}
