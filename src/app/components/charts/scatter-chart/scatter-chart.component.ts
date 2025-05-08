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
  @Input() label = ''
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>
  private chart?: Chart<'scatter', ScatterDataPoint[], unknown>

  ngAfterViewInit() {
    this.renderChart()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['points'] && !changes['points'].firstChange) {
      this.renderChart()
    }
  }

  private renderChart() {
    const ctx = this.canvasRef.nativeElement.getContext('2d')
    if (!ctx) return
    if (this.chart) this.chart.destroy()

    const config: ChartConfiguration<'scatter', ScatterDataPoint[], unknown> = {
      type: 'scatter',
      data: { datasets: [{ label: this.label, data: this.points, showLine: false }] },
      options: {
        scales: { x: { type: 'time', time: { unit: 'minute' } } },
      },
    }
    this.chart = new Chart(ctx, config)
  }
}
