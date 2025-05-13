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
import { StatisticsDisplayComponent } from '../../components/statistics/statistics-display/statistics-display.component'
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

@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    StatisticsDisplayComponent,
    CommonModule,
    MatButtonModule,
    SensorGroupSelectorComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    DateTimePickerComponent,
  ],
  providers: [{ provide: MatFormFieldControl, useExisting: DateTimePickerComponent }],
  templateUrl: './statistics-page.component.html',
  styleUrl: './statistics-page.component.scss',
})
export class StatisticsPageComponent implements OnInit {
  timeForm!: FormGroup
  submitted = false
  resultsGroup1?: StatisticResult
  resultsGroup2?: StatisticResult
  correlation?: number
  errorMessage?: string
  private storageKey = 'statisticsResult'

  constructor(
    private fb: FormBuilder,
    private stats: StatsService,
    private storage: WebStorageService
  ) {}

  ngOnInit(): void {
    this.timeForm = this.fb.group(
      {
        dateTimeRange: [null, Validators.required],
        group1: [null, Validators.required],
        group2: [null, Validators.required],
      },
      { updateOn: 'submit' }
    )
    this.loadFromStorage()
  }

  onCompute(): void {
    this.submitted = true
    this.clearResults()

    // this.timeForm.updateValueAndValidity({ onlySelf: false, emitEvent: true })
    this.timeForm.markAllAsTouched()
    //this.timeForm.updateValueAndValidity();

    if (this.timeForm.invalid) {
      this.errorMessage =
        'Für mindestens eine Gruppe wurden keine Daten im gewählten Zeitraum gefunden.'
      return
    }
    const { fromDate, fromTime, toDate, toTime } = this.timeForm.value
      .dateTimeRange as DateTimeRange
    const fromIso = this.combineDateTime(fromDate!, fromTime!)
    const toIso = this.combineDateTime(toDate!, toTime!)
    this.fetchStatisticsAndCorrelation(fromIso, toIso)
  }

  /**
   * Fetch both statistics and correlation in parallel.
   */
  private fetchStatisticsAndCorrelation(fromIso: string, toIso: string): void {
    forkJoin({
      s1: this.stats.computeStats(this.group1Ctrl.value, new Date(fromIso), new Date(toIso)),
      s2: this.stats.computeStats(this.group2Ctrl.value, new Date(fromIso), new Date(toIso)),
      corr: this.stats.computeCorrelation(
        this.group1Ctrl.value,
        this.group2Ctrl.value,
        new Date(fromIso),
        new Date(toIso)
      ),
    }).subscribe({
      next: ({ s1, s2, corr }) => this.onResults(s1, s2, corr),
      error: () => (this.errorMessage = 'Fehler beim Abrufen der Statistik-Daten.'),
    })
  }
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
    this.storage.set(this.storageKey, '')
  }

  private clearResults(): void {
    this.resultsGroup1 = undefined
    this.resultsGroup2 = undefined
    this.correlation = undefined
    this.errorMessage = undefined
  }

  private combineDateTime(date: Date, time: string): string {
    const [h, m] = time.split(':').map(Number)
    const copy = new Date(date)
    copy.setHours(h, m, 0, 0)
    return copy.toISOString()
  }

  private loadFromStorage() {
    const raw = this.storage.get(this.storageKey)
    if (raw) {
      try {
        const stored = JSON.parse(raw) as { s1: StatisticResult; s2: StatisticResult; corr: number }
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
}
