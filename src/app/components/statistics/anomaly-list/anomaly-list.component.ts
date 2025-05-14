import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatTableModule } from '@angular/material/table'
import { Anomaly } from '../../../models/anomaly.model'

@Component({
  selector: 'app-anomaly-list',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './anomaly-list.component.html',
  styleUrl: './anomaly-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnomalyListComponent {
  @Input() anomalies: Anomaly[] = []

  displayedColumns = ['timestamp', 'value', 'type']
}
