import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { LineChartComponent } from '../line-chart/line-chart.component'
import { BarChartComponent } from '../bar-chart/bar-chart.component'
import { HeatmapChartComponent } from '../heatmap-chart/heatmap-chart.component'
import { ChartType } from '../chart-config-row/chart-config-row.component'
import { Chart, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
/**
 * Host-Komponente, die basierend auf dem ChartType die jeweilige Chart-Komponente rendert.
 */
@Component({
  selector: 'app-chart-host',
  standalone: true,
  imports: [CommonModule, LineChartComponent, BarChartComponent, HeatmapChartComponent],
  templateUrl: './chart-host.component.html',
  styleUrls: ['./chart-host.component.scss'],
})
export class ChartHostComponent {
  /** Datenreihen mit Label, Datenpunkte und Farbe */
  @Input() dataSeries!: {
    label: string
    data: { timestamp: string; value: number }[]
    color: string
  }[]
  /** Chart-Type: 'line' | 'bar' | 'heatmap' */
  @Input() chartType: ChartType = 'line'

  constructor() {
    Chart.register(...registerables)
  }
}
