import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
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
    plugins: { tooltip: { mode: 'nearest', intersect: false }, legend: { position: 'top' } },
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSeries']) {
      this.updateChart()
    }
  }

  private updateChart(): void {
    const labels = this.dataSeries[0]?.data.map((pt) => pt.timestamp) || []
    const datasets = this.dataSeries.map((s) => ({
      label: s.label,
      data: s.data.map((pt) => pt.value),
      borderColor: s.color,
      backgroundColor: s.color,
      fill: false,
      tension: 0.1,
      borderWidth: 1, // Make lines thinner
      pointRadius: 2, // Make points smaller
      pointHoverRadius: 3,
    }))
    this.chartData = { labels, datasets }
  }
}
