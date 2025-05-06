import { Component, Input, ChangeDetectionStrategy } from '@angular/core'
import { StatisticResult, Series } from '../../../models/stats.model'
import { MatTableModule } from '@angular/material/table'
import { CommonModule } from '@angular/common'
import { MatListModule } from '@angular/material/list'
import { ScatterChartComponent } from '../../charts/scatter-chart/scatter-chart.component'

@Component({
  selector: 'app-statistics-display',
  standalone: true,
  imports: [MatTableModule, CommonModule, MatListModule, ScatterChartComponent],
  templateUrl: './statistics-display.component.html',
  styleUrl: './statistics-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsDisplayComponent {
  @Input() stats?: StatisticResult
  trackByName = (_: number, s: Series) => s.measurementName
}
