import { Component, OnInit } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { StatsService } from '../../components/statistics/stats.service'
import { SensorGroup, StatisticResult } from '../../models/stats.model'
import { CommonModule } from '@angular/common'
import { SensorGroupSelectorComponent } from '../../shared/sensor-group-selector/sensor-group-selector.component'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { forkJoin } from 'rxjs'
import { MatIconModule } from '@angular/material/icon'
import { WebStorageService } from '../../services/webStorage.service'
import {
  DateTimePickerComponent,
  DateTimeRange,
} from '../../shared/date-time-picker/date-time-picker.component'
import { AnomalyListComponent } from '../../components/statistics/anomaly-list/anomaly-list.component'
import { Anomaly } from '../../models/anomaly.model'
import { ScatterChartComponent } from '../../components/charts/scatter-chart/scatter-chart.component'
import { ScatterDataPoint } from 'chart.js'
import { QuickRangeKey } from '../../models/quickRange.enum'

@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    CommonModule,
    MatButtonModule,
    SensorGroupSelectorComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    DateTimePickerComponent,
    AnomalyListComponent,
    ScatterChartComponent,
  ],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: DateTimePickerComponent,
    },
  ],
  templateUrl: './statistics-page.component.html',
  styleUrl: './statistics-page.component.scss',
})

/**
 * StatisticsPageComponent
 *
 * Main page for computing statistics and anomaly detection between two sensor groups.
 * Presents controls for selecting sensor groups and a date-time range,
 * displays computed statistics, correlation, scatter charts, and anomaly lists.
 */
export class StatisticsPageComponent implements OnInit {
  /** Flag: statistics computed and anomaly button enabled */
  canShowAnomalies = false
  /** Flag: user clicked 'Anomalien anzeigen' */
  anomalyChecked = false

  /** Results and derived data */
  resultsGroup1?: StatisticResult
  resultsGroup2?: StatisticResult
  correlation?: number
  anomaliesGroup1: Anomaly[] = []
  anomaliesGroup2: Anomaly[] = []
  anomaliesPointsGroup1: ScatterDataPoint[] = []
  anomaliesPointsGroup2: ScatterDataPoint[] = []
  simultaneousAnomalies: ScatterDataPoint[] = []

  /** FormGroup for inputs */
  timeForm!: FormGroup
  submitted = false
  errorMessage?: string

  private storageKey = 'statisticsResult'

  constructor(
    private fb: FormBuilder,
    private stats: StatsService,
    private storage: WebStorageService
  ) {}

  /**
   * Initialize the reactive form and attempt to load saved state.
   */
  ngOnInit(): void {
    this.timeForm = this.fb.group(
      {
        dateTimeRange: this.fb.control(null, { updateOn: 'submit' }),
        quickRange: [null],
        group1: [null, Validators.required],
        group2: [null, Validators.required],
      }
      // { updateOn: 'submit' }
    )
    this.loadFromStorage()
  }

  get dateControl(): FormControl {
    return this.timeForm.get('dateTimeRange') as FormControl
  }
  get quickControl(): FormControl {
    return this.timeForm.get('quickRange') as FormControl
  }
  get g1(): FormControl {
    return this.timeForm.get('group1') as FormControl
  }
  get g2(): FormControl {
    return this.timeForm.get('group2') as FormControl
  }

  applyQuick(key: QuickRangeKey): void {
    if (!this.group1Ctrl.value || !this.group2Ctrl.value) {
      this.errorMessage = 'Bitte beide Gruppen auswählen.'
      return
    }
    this.errorMessage = undefined
    this.quickControl.setValue(key)
    this.onCompute()
  }
  onQuickRangeChange(key: QuickRangeKey | null): void {
    this.quickControl.setValue(key)
  }
  /**
   * Handler for the "Berechnen" button: validate, clear prior state,
   * and trigger fetching of new statistics and correlation.
   */
  onCompute(): void {
    this.submitted = true
    this.clearResults()
    this.clearAnomalies()
    this.anomalyChecked = false

    // this.timeForm.markAllAsTouched()

    const g1 = this.group1Ctrl.value as SensorGroup
    const g2 = this.group2Ctrl.value as SensorGroup

    if (!g1 || !g2) {
      this.errorMessage = 'Bitte beide Gruppen auswählen.'
      return
    }
    const quickTimeRange = this.quickControl.value as QuickRangeKey | null
    const dateTimeCtrl = this.timeForm.get('dateTimeRange') as FormControl<DateTimeRange | null>

    if (!quickTimeRange && !dateTimeCtrl.value) {
      this.errorMessage = 'Bitte komplettes Zeitintervall auswählen oder Quick-Range klicken.'
      return
    }
    let fromIso: string | undefined
    let toIso: string | undefined

    if (quickTimeRange) {
      fromIso = undefined
      toIso = undefined
    }
    if (!quickTimeRange) {
      if (this.timeForm.invalid) {
        this.errorMessage =
          'Für mindestens eine Gruppe wurden keine Daten im gewählten Zeitraum gefunden.'
        return
      }

      if (!dateTimeCtrl) {
        this.errorMessage = 'Bitte komplettes Zeitintervall auswählen.'
        return
      }
      const { fromDate, fromTime, toDate, toTime } = dateTimeCtrl.value as DateTimeRange
      fromIso = this.combineDateTime(fromDate!, fromTime!)
      toIso = this.combineDateTime(toDate!, toTime!)
    }

    /**
     * Perform parallel HTTP calls: computeStats for two groups and correlation.
     * @param fromIso ISO string for start datetime
     * @param toIso ISO string for end datetime
     */

    forkJoin({
      s1: this.stats.computeStats(
        g1,
        fromIso ? new Date(fromIso) : undefined,
        toIso ? new Date(toIso) : undefined,
        quickTimeRange || undefined
      ),
      s2: this.stats.computeStats(
        g2,
        fromIso ? new Date(fromIso) : undefined,
        toIso ? new Date(toIso) : undefined,
        quickTimeRange || undefined
      ),
      corr: this.stats.computeCorrelation(
        g1,
        g2,
        fromIso ? new Date(fromIso) : undefined,
        toIso ? new Date(toIso) : undefined,
        quickTimeRange || undefined
      ),
    }).subscribe({
      next: ({ s1, s2, corr }) => this.onResults(s1, s2, corr),
      error: () =>
        (this.errorMessage =
          'Für mindestens eine Gruppe wurden keine Daten im gewählten Zeitraum gefunden.'),
    })
  }

  /**
   * Called when both stats and correlation have been fetched.
   * @param s1 Statistics for group1
   * @param s2 Statistics for group2
   * @param corr Pearson correlation coefficient
   */
  private onResults(s1: StatisticResult, s2: StatisticResult, corr: number): void {
    if (!s1.count || !s2.count) {
      this.errorMessage =
        'Für mindestens eine Gruppe wurden keine Daten im gewählten Zeitraum gefunden.'
      return
    }
    this.resultsGroup1 = s1
    this.resultsGroup2 = s2
    this.correlation = corr
    this.saveToStorage(s1, s2, corr)
    this.canShowAnomalies = true
  }

  /**
   * Handler for "Anomalien anzeigen" button.
   * Triggers outlier detection and marks anomalyChecked flag.
   */
  onShowAnomalies(): void {
    this.errorMessage = undefined
    this.anomalyChecked = true
    const { from, to } = this.dateRange

    forkJoin({
      g1: this.stats.detectOutliers(this.group1Ctrl.value, from, to),
      g2: this.stats.detectOutliers(this.group2Ctrl.value, from, to),
    }).subscribe(({ g1, g2 }) => {
      this.anomaliesGroup1 = g1
      this.anomaliesGroup2 = g2
      this.prepareScatterPoints()
    })
  }

  /**
   * Build scatter-plot data for anomalies and simultaneous points.
   */
  private prepareScatterPoints(): void {
    this.anomaliesPointsGroup1 = this.anomaliesGroup1.map((a) => ({
      x: +a.timestamp,
      y: a.value,
    }))
    this.anomaliesPointsGroup2 = this.anomaliesGroup2.map((a) => ({
      x: +a.timestamp,
      y: a.value,
    }))
    this.simultaneousAnomalies = this.findSimultaneous(
      this.anomaliesPointsGroup1,
      this.anomaliesPointsGroup2,
      1800_000
    )
  }

  private findSimultaneous(
    list1: ScatterDataPoint[],
    list2: ScatterDataPoint[],
    toleranceMs: number
  ): ScatterDataPoint[] {
    return list1.filter((p1) => list2.some((p2) => Math.abs(p1.x - p2.x) <= toleranceMs))
  }

  private get dateRange(): { from: Date; to: Date } {
    const raw = this.timeForm.value.dateTimeRange as DateTimeRange
    return {
      from: new Date(this.combineDateTime(raw.fromDate!, raw.fromTime!)),
      to: new Date(this.combineDateTime(raw.toDate!, raw.toTime!)),
    }
  }

  /** Typed Getter für Sensorgruppe 1 */
  get group1Ctrl(): FormControl<SensorGroup> {
    return this.timeForm.get('group1') as FormControl<SensorGroup>
  }

  get group2Ctrl(): FormControl<SensorGroup> {
    return this.timeForm.get('group2') as FormControl<SensorGroup>
  }

  onClear(): void {
    this.submitted = false
    this.clearResults()
    this.clearAnomalies()
    this.storage.set(this.storageKey, '')
  }

  /**
   * Clear only statistical results and related flags.
   */
  private clearResults(): void {
    this.resultsGroup1 = undefined
    this.resultsGroup2 = undefined
    this.correlation = undefined
    this.errorMessage = undefined
    this.canShowAnomalies = false
    this.anomalyChecked = false
  }

  /**
   * Clear all anomaly arrays.
   */
  private clearAnomalies(): void {
    this.anomaliesGroup1 = []
    this.anomaliesGroup2 = []
    this.anomaliesPointsGroup1 = []
    this.anomaliesPointsGroup2 = []
    this.simultaneousAnomalies = []
  }

  /**
   * Combine a Date and time string ("HH:mm") into an ISO datetime string.
   * @param date Date object
   * @param time Time string "HH:mm"
   * @returns ISO 8601 string
   */
  private combineDateTime(date: Date, time: string): string {
    const [h, m] = time.split(':').map(Number)
    const copy = new Date(date)
    copy.setHours(h, m, 0, 0)
    return copy.toISOString()
  }

  /**
   * Load saved stats & correlation from local storage.
   */
  private loadFromStorage() {
    const raw = this.storage.get(this.storageKey)
    if (raw) {
      try {
        const stored = JSON.parse(raw) as {
          s1: StatisticResult
          s2: StatisticResult
          corr: number
        }
        this.resultsGroup1 = stored.s1
        this.resultsGroup2 = stored.s2
        this.correlation = stored.corr
      } catch {
        this.storage.set(this.storageKey, '')
      }
    }
  }

  private saveToStorage(s1: StatisticResult, s2: StatisticResult, corr: number) {
    const payload = JSON.stringify({ s1, s2, corr })
    this.storage.set(this.storageKey, payload)
  }

  /**
   * Check if both statistic results are available.
   */
  get resultsAvailable(): boolean {
    return !!(this.resultsGroup1 && this.resultsGroup2)
  }

  /**
   * Check if any anomalies were detected.
   */
  get anomaliesVisible(): boolean {
    return this.anomaliesGroup1.length > 0 || this.anomaliesGroup2.length > 0
  }

  /**
   * Extract other timestamps for simultaneous comparison.
   */
  get otherTimestampsGroup1(): number[] {
    return this.anomaliesGroup1.map((a) => +a.timestamp)
  }
  get otherTimestampsGroup2(): number[] {
    return this.anomaliesGroup2.map((a) => +a.timestamp)
  }

  protected readonly QuickRangeKey = QuickRangeKey
}
