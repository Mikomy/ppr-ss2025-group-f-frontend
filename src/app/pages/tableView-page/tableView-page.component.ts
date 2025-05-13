import { Component, OnInit } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
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
import { CdkDrag } from '@angular/cdk/drag-drop'
import { MeasurementTableComponent } from '../../shared/measurement-table/measurement-table.component'
import { SavedTable } from '../../models/savedTable.model'
import {
  DateTimePickerComponent,
  DateTimeRange,
} from '../../shared/date-time-picker/date-time-picker.component'

/**
 * Component for displaying and managing sensor measurement tables.
 * Users can select a sensor and date/time range, load detailed measurements,
 * and display multiple draggable tables. Persisted tables are stored in local
 * web storage under a configurable key.
 */
@Component({
  selector: 'app-tabellenansicht-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    SensorDropdownComponent,
    MeasurementTableComponent,
    DateTimePickerComponent,
    CdkDrag,
  ],
  templateUrl: './tableView-page.component.html',
  styleUrls: ['./tableView-page.component.scss'],
})
export class TableViewPageComponent implements OnInit {
  /** Currently selected dropdown option containing sensor and measurement info */
  selectedOption?: DropdownOptionModel

  /** Start date for filtering measurement data */
  fromDate?: Date

  /** Start time (HH:mm) for filtering measurement data */
  fromTime?: string

  /** End date for filtering measurement data */
  toDate?: Date

  /** End time (HH:mm) for filtering measurement data */
  toTime?: string

  /** Holds error messages to display in the view */
  errorMessage?: string

  /** Array of saved table configurations, loaded from web storage */
  savedTables: SavedTable[] = []

  /** Key used for persisting saved tables in web storage */
  private storageKey = 'saved-sensor-tables'
  timeForm!: FormGroup

  /**
   * @param backendService Service to fetch measurement data from the server
   * @param storage        Web storage service for persisting table configurations
   */
  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    private storage: WebStorageService
  ) {}

  /**
   * Lifecycle hook: initializes the component by loading any saved tables
   * from web storage into the `savedTables` array.
   */
  ngOnInit(): void {
    const raw = this.storage.get(this.storageKey)
    this.savedTables = raw ? (JSON.parse(raw) as SavedTable[]) : []
    this.timeForm = this.fb.group({
      dateTimeRange: [null, Validators.required],
    })
  }

  /**
   * Handler for sensor dropdown selection change.
   * Resets all date, time, and error fields.
   * @param selected The new dropdown option selected by the user
   */
  onSelectionChange(selected: DropdownOptionModel): void {
    this.selectedOption = { ...selected }
    this.errorMessage = undefined
  }

  /**
   * Validates user input and, if valid, requests detailed measurement data
   * from the backend service and adds a new table to `savedTables`.
   * Displays error messages on invalid input or request failure.
   */
  loadDetailedMeasurement(): void {
    if (!this.selectedOption) {
      this.errorMessage = 'Bitte Sensor auswählen.'
      return
    }
    const dateTimeCtrl = this.timeForm.value.dateTimeRange as DateTimeRange
    if (!dateTimeCtrl) {
      this.errorMessage = 'Bitte komplettes Zeitintervall auswählen.'
      return
    }
    if (!this.selectedOption) {
      this.errorMessage = 'Bitte einen Measurement auswählen.'
      return
    }

    const fromIso = this.combineDateAndTime(dateTimeCtrl.fromDate!, dateTimeCtrl.fromTime!)
    const toIso = this.combineDateAndTime(dateTimeCtrl.toDate!, dateTimeCtrl.toTime!)
    const alias = this.selectedOption.alias

    // Fetch measurement data and handle response
    this.backendService
      .getGroupedByAlias(alias, fromIso, toIso)
      .pipe(take(1))
      .subscribe({
        next: (measurement) => {
          if (!measurement.length) {
            this.errorMessage =
              'Keine Daten für den ausgewählten Measurement im angegebenen Zeitraum vorhanden.'
            return
          }
          const sensorName = this.selectedOption!.sensor.name
          const match = measurement.find((m) => m.sensor.name === sensorName)
          if (!match || !match.dataPoints.length) {
            this.errorMessage = 'Keine Daten für Sensor "${this.selectedOption!.sensor.name}".'
            return
          }
          if (!match.dataPoints.length) {
            this.errorMessage = 'Keine Messwerte im gewählten Zeitraum vorhanden.'
          }
          this.errorMessage = undefined
          this.addTable(match, fromIso, toIso)
        },
        error: () => (this.errorMessage = 'Fehler beim Laden der Daten.'),
      })
  }

  private combineDateAndTime(date: Date, time: string) {
    const dt = new Date(date)
    const [h, m] = time.split(':').map(Number)
    dt.setHours(h, m)
    return dt.toISOString()
  }

  /**
   * Adds a new table configuration to the savedTables and persists it.
   * @param data Measurement data returned from backend
   * @param from ISO string representing start of data range
   * @param to   ISO string representing end of data range
   */
  private addTable(data: Measurement, from: string, to: string): void {
    const id = Date.now().toString()
    this.savedTables = [
      ...this.savedTables,
      { id, name: this.selectedOption!.measurementName, from, to, data },
    ]
    this.storage.set(this.storageKey, JSON.stringify(this.savedTables))
  }

  /**
   * Removes a table configuration by id and updates persisted storage.
   * @param id Unique identifier of the table to remove
   */
  removeTable(id: string): void {
    this.savedTables = this.savedTables.filter((t) => t.id !== id)
    this.storage.set(this.storageKey, JSON.stringify(this.savedTables))
  }
}
