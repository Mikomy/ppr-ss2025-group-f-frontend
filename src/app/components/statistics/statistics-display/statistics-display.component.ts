import { Component, Input, ChangeDetectionStrategy } from '@angular/core'
import { StatisticResult } from '../../../models/stats.model'
import { MatTableModule } from '@angular/material/table'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-statistics-display',
  standalone: true,
  imports: [MatTableModule, CommonModule],
  templateUrl: './statistics-display.component.html',
  styleUrl: './statistics-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsDisplayComponent {
  @Input() stats?: StatisticResult
}
