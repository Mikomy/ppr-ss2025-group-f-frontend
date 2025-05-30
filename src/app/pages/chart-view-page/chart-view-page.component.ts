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
      dateTimeRange: [null],
      quickRange: [null],
    })
  }

  applyQuick(key: QuickRangeKey): void {
    this.timeForm.patchValue({ quickRange: key, dateTimeRange: null })
    this.loadCharts()
  }
  // onQuickRangeChange(key:QuickRangeKey | null) {
  //   this.timeForm.get('quickRange')!.setValue(key);
  // }

  onConfigChange(index: number, config: ChartConfig): void {
    this.configs[index] = config
    this.errorMessage = undefined
  }

  get quickControl(): FormControl {
    return this.timeForm.get('quickRange') as FormControl
  }

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
          const label = quickTimeRange ? [quickTimeRange] : [fromIso!, ' - ', toIso!]
          const newChart: SavedChart = {
            id,
            titles: selectedConfigs.map((c) => c.measurement!.measurementName),
            label,
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
      error: () =>
        (this.errorMessage =
          'Für mindestens eine Measurement wurden keine Daten im gewählten Zeitraum gefunden.'),
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

  protected readonly QuickRangeKey = QuickRangeKey
}
