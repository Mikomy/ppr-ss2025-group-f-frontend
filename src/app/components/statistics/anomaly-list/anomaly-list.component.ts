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
  /**
   * Array of anomalies to display in the table.
   */
  @Input() anomalies: Anomaly[] = []
  /**
   * Unix epoch timestamps of anomalies in the other group, used to mark simultaneous events.
   */
  @Input() otherTimestamps: number[] = []
  /**
   * Label text for the "simultaneous" column header.
   */
  @Input() otherLabel = ''
  /**
   * Title displayed in the card header.
   */
  @Input() title = ''

  /**
   * Column identifiers for the Material table.
   */
  displayedColumns: string[] = ['timestamp', 'value', 'type', 'simultaneous']

  /**
   * Determines whether a given anomaly's timestamp is also present in the otherTimestamps array.
   * Converts Date to numeric epoch ms before comparison.
   * @param timestamp Date object of the anomaly event.
   * @returns true if timestamp's epoch ms exists in otherTimestamps; otherwise false.
   */
  isSimultaneous(timestamp: Date): boolean {
    return this.otherTimestamps.includes(timestamp.getTime())
  }
}
