import { Component, OnInit } from '@angular/core'
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { forkJoin } from 'rxjs'
import { take } from 'rxjs/operators'

import { ChartPanelComponent } from '../../components/charts/chart-panel/chart-panel.component'
import { BackendService } from '../../services/backend.service'
import { WebStorageService } from '../../services/webStorage.service'
import { CommonModule } from '@angular/common'
import { MatTableModule } from '@angular/material/table'
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop'
import { SavedChart } from '../../models/savedChart.model'
import {
  ChartConfig,
  ChartConfigRowComponent,
} from '../../components/charts/chart-config-row/chart-config-row.component'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import {
  DateTimePickerComponent,
  DateTimeRange,
} from '../../shared/date-time-picker/date-time-picker.component'
import { FormControl } from '@angular/forms'
import { QuickRangeKey } from '../../models/quickRange.enum'

@Component({
  selector: 'app-chart-view-page',
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
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    CdkDrag,
    ChartConfigRowComponent,
    ChartPanelComponent,
    MatButtonToggleModule,
    DateTimePickerComponent,
    CdkDragHandle,
  ],
  templateUrl: './chart-view-page.component.html',
  styleUrl: './chart-view-page.component.scss',
})
export class ChartViewPageComponent implements OnInit {
  /**
   * An array of ChartConfig objects, initialized with three default configs.
   * Each config holds color and chartType properties; measurement is assigned later.
   */
  configs: ChartConfig[] = Array(3)
    .fill({ color: '#3366cc', chartType: 'line' })
    .map((c) => ({ ...c }))

  /** Reactive form containing dateTimeRange and quickRange FormControls */
  timeForm!: FormGroup
  /** Error message shown when date/time validation fails */
  timeError?: string
  /** General error message shown for measurement loading errors */
  errorMessage?: string
  /** Array of charts persisted in local storage */
  savedCharts: SavedChart[] = []
  /** Key used to store savedCharts in local storage */
  private storageKey = 'saved-sensor-charts'

  /**
   * @param fb         FormBuilder for constructing reactive forms
   * @param backend    Service responsible for fetching measurement data
   * @param storage    Service for reading/writing local storage
   */
  constructor(
    private fb: FormBuilder,
    private backend: BackendService,
    private storage: WebStorageService
  ) {}

  /**
   * Initializes the form, loads any saved charts,
   * and sets up a valueChanges subscription to clear quickRange when the user
   * selects a manual date range.
   */
  ngOnInit(): void {
    const raw = this.storage.get(this.storageKey)
    this.savedCharts = raw ? JSON.parse(raw) : []

    this.timeForm = this.fb.group({
      dateTimeRange: [null as DateTimeRange | null],
      quickRange: [null as QuickRangeKey | null],
    })
  }

  /**
   * Applies a predefined quick time range (e.g., last week, last month).
   * Clears the manual date picker, sets quickRange, and then triggers chart loading.
   *
   * @param key  The QuickRangeKey enum value representing the selected quick range
   */
  applyQuick(key: QuickRangeKey): void {
    this.timeForm.patchValue({ quickRange: key, dateTimeRange: null })
    this.loadCharts()
  }

  /**
   * Updates the ChartConfig at the specified index when its values change.
   * Also clears any existing error messages.
   *
   * @param index   Index of the config row to update
   * @param config  The new ChartConfig object provided by the child component
   */
  onConfigChange(index: number, config: ChartConfig): void {
    this.configs[index] = config
    this.errorMessage = undefined
  }

  /**
   * Getter for the quickRange FormControl.
   *
   * @returns FormControl instance managing the quickRange value
   */
  get quickControl(): FormControl {
    return this.timeForm.get('quickRange') as FormControl
  }

  /**
   * Validates user input for at least one selected measurement and either a
   * manual date range or a quick range. Then fetches data for each selected
   * config in parallel, constructs a new SavedChart from the results, and
   * persists it to local storage. Resets quickRange after successful load.
   */
  loadCharts(): void {
    // Validate at least one measurement and full interval
    const selectedConfigs = this.configs.filter((cfg) => cfg.measurement)
    if (!selectedConfigs.length) {
      this.errorMessage = 'Bitte mindestens eine Messung auswählen.'
      return
    }

    // const quickTimeRange = this.quickControl.value as QuickRangeKey;
    const quickTimeRange = this.quickControl.value as QuickRangeKey
    const dateTimeCtrl = this.timeForm.get('dateTimeRange') as FormControl<DateTimeRange | null>
    let fromIso: string | undefined
    let toIso: string | undefined

    if (!quickTimeRange && !dateTimeCtrl.value) {
      this.errorMessage = 'Bitte komplettes Zeitintervall auswählen oder Quick-Range klicken.'
      return
    }

    if (quickTimeRange) {
      fromIso = undefined
      toIso = undefined
    } else {
      if (!dateTimeCtrl) {
        this.errorMessage = 'Bitte komplettes Zeitintervall auswählen.'
        return
      }

      // Build ISO strings
      const { fromDate, fromTime, toDate, toTime } = dateTimeCtrl.value as DateTimeRange
      fromIso = this.combineDateAndTime(fromDate!, fromTime!)
      toIso = this.combineDateAndTime(toDate!, toTime!)
    }
    this.errorMessage = undefined
    this.timeError = undefined
    // Fetch all series
    const calls = selectedConfigs.map((cfg) =>
      this.backend
        .getGroupedByAlias(cfg.measurement!.alias!, fromIso, toIso, quickTimeRange)
        .pipe(take(1))
    )

    forkJoin(calls).subscribe({
      next: (groups) => {
        try {
          const series = groups.map((measurements, idx) => {
            const cfg = selectedConfigs[idx]
            const sensor = cfg.measurement!.sensor.name
            const m = measurements.find((x) => x.sensor.name === sensor)
            if (!m || !m.dataPoints.length) {
              throw new Error(`Keine Daten für Sensor ${sensor}`)
            }
            return {
              label: cfg.measurement!.measurementName,
              data: m.dataPoints.map((dp) => ({ timestamp: dp.timestamp, value: dp.value })),
              color: cfg.color,
              chartType: cfg.chartType,
            }
          })

          const id = Date.now().toString()
          const label = quickTimeRange ? [quickTimeRange] : [fromIso!, ' - ', toIso!]
          const newChart: SavedChart = {
            id,
            titles: selectedConfigs.map((c) => c.measurement!.measurementName),
            label,
            series,
          }
          this.savedCharts = [...this.savedCharts, newChart]
          this.storage.set(this.storageKey, JSON.stringify(this.savedCharts))

          // Reset all sensor dropdowns (measurement = undefined)
          this.configs = this.configs.map((c) => ({
            color: c.color,
            chartType: c.chartType,
          }))

          if (quickTimeRange != null) {
            this.timeForm.patchValue({ quickRange: null }, { emitEvent: false })
          }
        } catch (error) {
          if (error instanceof Error) {
            this.errorMessage = error.message
          }
        }
      },
      error: () =>
        (this.errorMessage =
          'Für mindestens eine Measurement wurden keine Daten im gewählten Zeitraum gefunden.'),
    })
  }

  /**
   * Combines a Date object and a time string ("HH:mm") into an ISO string.
   *
   * @param date  The Date part of the range
   * @param time  The time string in "HH:mm" format
   * @returns     An ISO 8601 formatted string representing the combined date-time
   */
  private combineDateAndTime(date: Date, time: string) {
    const dt = new Date(date)
    const [h, m] = time.split(':').map(Number)
    dt.setHours(h, m)
    return dt.toISOString()
  }

  /**
   * Removes a saved chart by its unique identifier and updates local storage.
   *
   * @param id  The ID of the chart to remove
   */
  removeChart(id: string): void {
    this.savedCharts = this.savedCharts.filter((c) => c.id !== id)
    this.storage.set(this.storageKey, JSON.stringify(this.savedCharts))
  }
  /** Expose QuickRangeKey enum to the template */
  protected readonly QuickRangeKey = QuickRangeKey
}
