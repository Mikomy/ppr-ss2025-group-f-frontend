import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BaseChartDirective } from 'ng2-charts'
import { ChartConfiguration } from 'chart.js'

/**
 * Bar-Chart-Komponente, visualisiert mehrere Messreihen als gruppierte Balken.
 * https://valor-software.com/ng2-charts/bar
 */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnChanges {
  @Input() dataSeries: {
    label: string
    data: { timestamp: string; value: number }[]
    color: string
  }[] = []

  public chartType: ChartConfiguration<'bar'>['type'] = 'bar'
  public chartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] }
  public chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Zeit' } },
      y: { title: { display: true, text: 'Wert' } },
    },
    plugins: { tooltip: { mode: 'index', intersect: false }, legend: { position: 'top' } },
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
      backgroundColor: s.color,
      borderColor: s.color,
      borderWidth: 1,
    }))
    this.chartData = { labels, datasets }
  }
}
