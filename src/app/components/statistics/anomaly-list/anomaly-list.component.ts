import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatTableModule } from '@angular/material/table'
import { Anomaly } from '../../../models/anomaly.model'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'

@Component({
  selector: 'app-anomaly-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatCardModule],
  templateUrl: './anomaly-list.component.html',
  styleUrl: './anomaly-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnomalyListComponent {
  @Input() anomalies: Anomaly[] = []
  @Input() otherTimestamps: number[] = []
  @Input() otherLabel = ''
  @Input() title = ''

  displayedColumns: string[] = ['timestamp', 'value', 'type', 'simultaneous']

  isSimultaneous(ts: Date): boolean {
    return this.otherTimestamps.includes(+ts)
  }
}
