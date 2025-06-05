import { Component, Input, OnChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import zoomPlugin from 'chartjs-plugin-zoom'
import { Chart } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { ChartConfiguration, ChartData, ChartDataset } from 'chart.js'
import { BaseChartDirective } from 'ng2-charts'

Chart.register(zoomPlugin)
/**
 * Host-Komponente, die basierend auf dem ChartType die jeweilige Chart-Komponente rendert.
 */
@Component({
  selector: 'app-chart-host',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './chart-host.component.html',
  styleUrls: ['./chart-host.component.scss'],
})
export class ChartHostComponent implements OnChanges {
  /**
   * Each series object must have:
   *  - label: string
   *  - data: Array<{ timestamp: string; value: number }>
   *  - color: string
   *  - chartType: 'line' | 'bar'
   */
  @Input() dataSeries!: {
    label: string
    data: { timestamp: string; value: number }[]
    color: string
    chartType: 'line' | 'bar'
  }[]

  /**
   * ChartData<'bar'|'line', { x: string; y: number }[], unknown>
   * We pass each data point as { x: ISO-String, y: number } directly.
   */
  public chartData: ChartData<'bar' | 'line', { x: string; y: number }[], unknown> = {
    datasets: [],
  }

  /**
   * Chart options:
   *  - No fixed `unit`, so Chart.js displays every x-coordinate individually.
   *  - Parsing is disabled for bar datasets to prevent internal binning.
   *  - Zoom plugin remains active.
   */
  public chartOptions: ChartConfiguration<'bar' | 'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'PP',
          displayFormats: {
            day: 'yyyy-MM-dd',
          },
        },
        title: { display: true, text: 'Datum' },
      },
      y: {
        title: { display: true, text: 'Wert' },
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: { mode: 'nearest', intersect: false },
      legend: { position: 'top' },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          modifierKey: 'ctrl',
        },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x',
        },
      },
    },
  }

  ngOnChanges(): void {
    this.updateChart()
  }

  /**
   * Builds the chartData object from dataSeries.
   * Uses parsing=false on bar datasets so that Chart.js does not group points.
   * Also enforces thin bars so that even 1000 bars fit.
   */
  private updateChart(): void {
    if (!this.dataSeries?.length) {
      this.chartData = { datasets: [] }
      return
    }

    // Wir transformieren nur in { x: ISO-String, y: number }
    const rawDatasets = this.dataSeries.map((s) => {
      const points: { x: string; y: number }[] = s.data.map((pt) => ({
        x: pt.timestamp, // bleibt String, kein new Date(...)
        y: pt.value,
      }))

      return {
        label: s.label,
        data: points,
        backgroundColor: s.color,
        borderColor: s.color,
        borderWidth: 1,
        type: s.chartType, // 'bar' oder 'line'
        ...(s.chartType === 'line'
          ? {
              tension: 0.1,
              fill: false,
              pointRadius: 2,
            }
          : {}),
      } as ChartDataset<'bar' | 'line', { x: string; y: number }[]>
    })

    this.chartData = {
      datasets: rawDatasets as ChartDataset<'bar' | 'line', { x: string; y: number }[]>[],
    }
  }
}
