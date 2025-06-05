import {
  Component,
  Input,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core'
import { Chart, ChartConfiguration, registerables, ScatterDataPoint } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { ChartDataset } from 'chart.js'

Chart.register(...registerables)

@Component({
  selector: 'app-scatter-chart',
  standalone: true,
  templateUrl: './scatter-chart.component.html',
  styleUrl: './scatter-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScatterChartComponent implements AfterViewInit, OnChanges {
  @Input() points: ScatterDataPoint[] = []
  @Input() anomalies: ScatterDataPoint[] = []
  @Input() simultaneous: ScatterDataPoint[] = []
  @Input() label = ''
  @Input() lowThreshold?: number
  @Input() highThreshold?: number
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>
  private chart?: Chart<'scatter', ScatterDataPoint[], unknown>

  ngAfterViewInit() {
    this.renderChart()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['points']?.firstChange || changes['anomalies'] || changes['simultaneous']) {
      this.renderChart()
    }
  }

  private renderChart() {
    const ctx = this.canvasRef.nativeElement.getContext('2d')
    if (!ctx) return
    if (this.chart) this.chart.destroy()

    const datasets: ChartDataset<'scatter', ScatterDataPoint[]>[] = [
      { label: this.label, data: this.points, showLine: false },
      ...(this.anomalies.length
        ? [
            {
              label: 'Ausreißer',
              data: this.anomalies,
              pointBorderColor: 'red',
              pointRadius: 6,
              showLine: false,
            },
          ]
        : []),
      ...(this.simultaneous.length
        ? [
            {
              label: 'Gleichzeitige Ausreißer',
              data: this.simultaneous,
              pointBackgroundColor: 'orange',
              pointRadius: 8,
              showLine: false,
            },
          ]
        : []),
    ]

    const xs = this.points.map((p) => p.x)
    const minX = xs.length ? Math.min(...xs) : 0
    const maxX = xs.length ? Math.max(...xs) : 0

    if (this.lowThreshold != null) {
      datasets.push({
        type: 'line',
        label: 'Low-Grenzwert',
        data: [
          { x: minX, y: this.lowThreshold },
          { x: maxX, y: this.lowThreshold },
        ],
        borderColor: 'blue',
        borderWidth: 1,
        showLine: true,
        pointRadius: 0,
        fill: false,
      } as unknown as ChartDataset<'scatter', ScatterDataPoint[]>)
    }
    if (this.lowThreshold != null) {
      datasets.push({
        type: 'line',
        label: 'High-Grenzwert',
        data: [
          { x: minX, y: this.highThreshold },
          { x: maxX, y: this.highThreshold },
        ],
        borderColor: 'blue',
        borderWidth: 1,
        showLine: true,
        pointRadius: 0,
        fill: false,
      } as unknown as ChartDataset<'scatter', ScatterDataPoint[]>)
    }

    const config: ChartConfiguration<'scatter', ScatterDataPoint[], unknown> = {
      type: 'scatter',
      data: { datasets },
      options: {
        scales: {
          x: { type: 'time', time: { unit: 'day', displayFormats: { day: 'dd.MM.yyyy' } } },
        },
      },
    }
    this.chart = new Chart(ctx, config)
  }
}
