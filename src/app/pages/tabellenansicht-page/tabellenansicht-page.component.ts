import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { FormsModule } from '@angular/forms'
import { SensorDropdownComponent } from '../../shared/sensor-dropdown/sensor-dropdown.component'
import { BackendService } from '../../services/backend.service'
import { Measurement } from '../../models/measurement.model'
import { DropdownOptionModel } from '../../models/dropdown.option.model'
import { take } from 'rxjs'
import { CommonModule } from '@angular/common'
import { MatTableModule } from '@angular/material/table'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { WebStorageService } from '../../services/webStorage.service'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { CdkDrag } from '@angular/cdk/drag-drop'
import { MeasurementTableComponent } from '../../shared/measurement-table/measurement-table.component'

interface SavedTable {
  id: string
  name: string
  from?: string
  to?: string
  data: Measurement
}

@Component({
  selector: 'app-tabellenansicht-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    SensorDropdownComponent,
    CdkDrag,
    MeasurementTableComponent,
  ],
  templateUrl: './tabellenansicht-page.component.html',
  styleUrls: ['./tabellenansicht-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabellenansichtPageComponent implements OnInit {
  selectedOption?: DropdownOptionModel
  fromDate?: Date
  fromTime?: string
  toDate?: Date
  toTime?: string
  errorMessage?: string

  savedTables: SavedTable[] = []
  private storageKey = 'saved-sensor-tables'

  constructor(
    private backendService: BackendService,
    private storage: WebStorageService
  ) {}

  ngOnInit(): void {
    const raw = this.storage.get(this.storageKey)
    this.savedTables = raw ? JSON.parse(raw) : []
  }

  onSelectionChange(selected: DropdownOptionModel): void {
    this.selectedOption = selected
    this.fromDate = undefined
    this.fromTime = undefined
    this.toDate = undefined
    this.toTime = undefined
    this.errorMessage = undefined
  }

  loadDetailedMeasurement(): void {
    if (!this.selectedOption || !this.fromDate || !this.fromTime || !this.toDate || !this.toTime) {
      this.errorMessage = 'Bitte wählen Sie Sensor, Datum und Uhrzeit aus.'
      return
    }
    const from = new Date(this.fromDate)
    from.setHours(+this.fromTime.split(':')[0], +this.fromTime.split(':')[1])
    const to = new Date(this.toDate)
    to.setHours(+this.toTime.split(':')[0], +this.toTime.split(':')[1])
    const fromIso = from.toISOString()
    const toIso = to.toISOString()

    this.backendService
      .getMeasurement(this.selectedOption.measurementName, fromIso, toIso)
      .pipe(take(1))
      .subscribe({
        next: (measurement) => this.addTable(measurement, fromIso, toIso),
        error: () => (this.errorMessage = 'Fehler beim Laden der Daten.'),
      })
  }

  private addTable(data: Measurement, from: string, to: string): void {
    const id = Date.now().toString()
    this.savedTables = [
      ...this.savedTables,
      { id, name: this.selectedOption!.measurementName, from, to, data },
    ]
    this.storage.set(this.storageKey, JSON.stringify(this.savedTables))
  }

  removeTable(id: string): void {
    this.savedTables = this.savedTables.filter((t) => t.id !== id)
    this.storage.set(this.storageKey, JSON.stringify(this.savedTables))
  }
}
