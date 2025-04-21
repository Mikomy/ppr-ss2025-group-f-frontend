import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
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
  ],
  templateUrl: './historische-analyse-page.component.html',
  styleUrl: './historische-analyse-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorischeAnalysePageComponent implements OnInit {
  configs: ChartConfig[] = Array(3)
    .fill({ color: '#3366cc', chartType: 'line' })
    .map((c) => ({ ...c }))
  fromDate?: Date
  fromTime?: string
  toDate?: Date
  toTime?: string
  errorMessage?: string

  savedCharts: SavedChart[] = []
  private storageKey = 'saved-sensor-charts'

  constructor(
    private backend: BackendService,
    private storage: WebStorageService
  ) {}

  ngOnInit(): void {
    const raw = this.storage.get(this.storageKey)
    this.savedCharts = raw ? JSON.parse(raw) : []
  }

  onConfigChange(index: number, config: ChartConfig): void {
    this.configs[index] = config
    this.errorMessage = undefined
  }

  loadCharts(): void {
    // Validate at least one measurement and full interval
    const selectedConfigs = this.configs.filter((cfg) => cfg.measurement)
    if (
      !selectedConfigs.length ||
      !this.fromDate ||
      !this.fromTime ||
      !this.toDate ||
      !this.toTime
    ) {
      this.errorMessage =
        'Bitte mindestens eine Messung und das vollständige Zeitintervall auswählen.'
      return
    }

    // Build ISO strings
    const from = new Date(this.fromDate)
    const [fromH, fromM] = this.fromTime.split(':').map(Number)
    from.setHours(fromH, fromM)
    const to = new Date(this.toDate)
    const [toH, toM] = this.toTime.split(':').map(Number)
    to.setHours(toH, toM)
    const fromIso = from.toISOString()
    const toIso = to.toISOString()

    // Fetch all series
    const calls = selectedConfigs.map((cfg) =>
      this.backend.getMeasurement(cfg.measurement!.measurementName, fromIso, toIso).pipe(take(1))
    )

    forkJoin(calls).subscribe(
      (measurements) => {
        const id = Date.now().toString()
        const titles = selectedConfigs.map((cfg) => cfg.measurement!.measurementName)
        const series = measurements.map((m, i) => ({
          label: titles[i],
          data: m.dataPoints.map((dp) => ({ timestamp: dp.timestamp, value: dp.value })),
          color: selectedConfigs[i].color,
        }))
        this.savedCharts = [
          ...this.savedCharts,
          {
            id,
            titles,
            from: fromIso,
            to: toIso,
            series,
            chartType: selectedConfigs[0].chartType,
          },
        ]
        this.storage.set(this.storageKey, JSON.stringify(this.savedCharts))
      },
      () => (this.errorMessage = 'Fehler beim Laden der Charts.')
    )
  }

  removeChart(id: string): void {
    this.savedCharts = this.savedCharts.filter((c) => c.id !== id)
    this.storage.set(this.storageKey, JSON.stringify(this.savedCharts))
  }
}
