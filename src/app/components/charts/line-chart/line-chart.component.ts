import { Component, Input, OnChanges, SimpleChanges, isDevMode } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BaseChartDirective } from 'ng2-charts'
import { ChartConfiguration } from 'chart.js'
import 'chartjs-adapter-date-fns'
/**
 * Line-Chart-Komponente, visualisiert mehrere Messreihen mit unterschiedlichen Farben.
 * https://valor-software.com/ng2-charts/line
 */
@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
})
export class LineChartComponent implements OnChanges {
  @Input() dataSeries: {
    label: string
    data: { timestamp: string; value: number }[]
    color: string
  }[] = []

  public chartType: ChartConfiguration<'line'>['type'] = 'line'
  public chartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] }
  public chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'PPpp',
          displayFormats: {
            hour: 'HH:mm',
            minute: 'HH:mm',
            day: 'MMM d',
          },
        },
        title: { display: true, text: 'Zeit' },
      },
      y: { title: { display: true, text: 'Wert' } },
    },
    plugins: {
      tooltip: { mode: 'nearest', intersect: false },
      legend: { position: 'top' },
    },
    animation: {
      // Disable animations in test environment to prevent timing issues
      duration: isDevMode() ? 500 : 0,
    },
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSeries']) {
      try {
        this.updateChart()
      } catch (error) {
        console.error('Error updating chart:', error)
        // Provide safe fallback data when errors occur
        this.chartData = {
          labels: [],
          datasets: [
            {
              label: 'No data',
              data: [],
              borderColor: '#ccc',
              backgroundColor: '#ccc',
            },
          ],
        }
      }
    }
  }

  private updateChart(): void {
    // Safely handle empty or invalid data
    if (!this.dataSeries || !this.dataSeries.length) {
      this.chartData = {
        labels: [],
        datasets: [],
      }
      return
    }

    // Find the series with the most data points to use for labels
    const seriesWithMostPoints = [...this.dataSeries].sort(
      (a, b) => (b.data?.length || 0) - (a.data?.length || 0)
    )[0]

    const labels = seriesWithMostPoints?.data?.map((pt) => pt.timestamp) || []

    // Ensure we process all series, even if some have missing data
    const datasets = this.dataSeries.map((s) => ({
      label: s.label,
      data: s.data?.map((pt) => pt.value) || [],
      borderColor: s.color,
      backgroundColor: s.color,
      fill: false,
      tension: 0.1,
      borderWidth: 1,
      pointRadius: 2,
      pointHoverRadius: 4,
    }))

    this.chartData = { labels, datasets }

    // Debug info to help diagnose test failures
    console.debug(`Chart updated with ${datasets.length} datasets`)
  }
}
