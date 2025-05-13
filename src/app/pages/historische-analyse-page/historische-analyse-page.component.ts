import { Component, OnInit } from '@angular/core'
import {
  FormGroup,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
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
import { CdkDrag } from '@angular/cdk/drag-drop'
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

@Component({
  selector: 'app-historische-analyse-page',
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
  ],
  templateUrl: './historische-analyse-page.component.html',
  styleUrl: './historische-analyse-page.component.scss',
})
export class HistorischeAnalysePageComponent implements OnInit {
  configs: ChartConfig[] = Array(3)
    .fill({ color: '#3366cc', chartType: 'line' })
    .map((c) => ({ ...c }))
  timeForm!: FormGroup

  timeError?: string
  errorMessage?: string

  savedCharts: SavedChart[] = []
  private storageKey = 'saved-sensor-charts'

  constructor(
    private fb: FormBuilder,
    private backend: BackendService,
    private storage: WebStorageService
  ) {}

  ngOnInit(): void {
    const raw = this.storage.get(this.storageKey)
    this.savedCharts = raw ? JSON.parse(raw) : []
    this.timeForm = this.fb.group({
      dateTimeRange: this.fb.control<DateTimeRange>(
        { fromDate: null, fromTime: null, toDate: null, toTime: null },
        Validators.required
      ),
    })
  }

  onConfigChange(index: number, config: ChartConfig): void {
    this.configs[index] = config
    this.errorMessage = undefined
  }

  loadCharts(): void {
    // Validate at least one measurement and full interval
    const selectedConfigs = this.configs.filter((cfg) => cfg.measurement)
    if (!selectedConfigs.length) {
      this.errorMessage = 'Bitte mindestens eine Messung auswählen.'
      return
    }

    const dateTimeCtrl = this.timeForm.get('dateTimeRange') as FormControl
    if (dateTimeCtrl.invalid) {
      const errors = dateTimeCtrl.errors || {}
      this.errorMessage = errors['required']
        ? 'Bitte komplettes Zeitintervall auswählen.'
        : errors['required']
          ? '„Von“ darf nicht nach „Bis“ liegen.'
          : undefined
      return
    }

    // Reset Errors
    this.errorMessage = undefined
    this.timeError = undefined

    // Build ISO strings
    const { fromDate, fromTime, toDate, toTime } = dateTimeCtrl.value as DateTimeRange
    const fromIso = this.combineDateAndTime(fromDate!, fromTime!)
    const toIso = this.combineDateAndTime(toDate!, toTime!)

    // Fetch all series
    const calls = selectedConfigs.map((cfg) =>
      this.backend.getGroupedByAlias(cfg.measurement!.alias!, fromIso, toIso).pipe(take(1))
    )

    forkJoin(calls).subscribe({
      next: (groups) => {
        try {
          const series = groups.map((measurements, idx) => {
            const sensor = selectedConfigs[idx].measurement!.sensor.name
            const m = measurements.find((x) => x.sensor.name === sensor)
            if (!m || !m.dataPoints.length) {
              throw new Error(`Keine Daten für Sensor ${sensor}`)
            }
            return {
              label: selectedConfigs[idx].measurement!.measurementName,
              data: m.dataPoints.map((dp) => ({ timestamp: dp.timestamp, value: dp.value })),
              color: selectedConfigs[idx].color,
            }
          })

          const id = Date.now().toString()
          const newChart: SavedChart = {
            id,
            titles: selectedConfigs.map((c) => c.measurement!.measurementName),
            from: fromIso,
            to: toIso,
            series,
            chartType: selectedConfigs[0].chartType,
          }
          this.savedCharts = [...this.savedCharts, newChart]
          this.storage.set(this.storageKey, JSON.stringify(this.savedCharts))
        } catch (error) {
          if (error instanceof Error) {
            this.errorMessage = error.message
          }
        }
      },
      error: () => (this.errorMessage = 'Fehler beim Laden der Charts.'),
    })
  }

  private combineDateAndTime(date: Date, time: string) {
    const dt = new Date(date)
    const [h, m] = time.split(':').map(Number)
    dt.setHours(h, m)
    return dt.toISOString()
  }

  removeChart(id: string): void {
    this.savedCharts = this.savedCharts.filter((c) => c.id !== id)
    this.storage.set(this.storageKey, JSON.stringify(this.savedCharts))
  }
}
