import { Component, LOCALE_ID, OnInit } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms'
import { StatsService } from '../../components/statistics/stats.service'
import { SensorGroup, StatisticResult } from '../../models/stats.model'
import { StatisticsDisplayComponent } from '../../components/statistics/statistics-display/statistics-display.component'
import { CommonModule, registerLocaleData } from '@angular/common'
import { SensorGroupSelectorComponent } from '../../shared/sensor-group-selector/sensor-group-selector.component'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatDatepickerModule } from '@angular/material/datepicker'
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core'
import { forkJoin } from 'rxjs'
import { MatIconModule } from '@angular/material/icon'
import localeDe from '@angular/common/locales/de'
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter'

registerLocaleData(localeDe, 'de')

export const DD_MM_YYYY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
}

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
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de-AT' },
    { provide: MAT_DATE_LOCALE, useValue: 'de-AT' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_FORMATS },
  ],
  templateUrl: './statistics-page.component.html',
  styleUrl: './statistics-page.component.scss',
})
export class StatisticsPageComponent implements OnInit {
  form!: FormGroup
  resultsGroup1?: StatisticResult
  resultsGroup2?: StatisticResult
  correlation?: number
  errorMessage?: string

  constructor(
    private fb: FormBuilder,
    private stats: StatsService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        fromDate: [null as Date | null, [Validators.required]],
        fromTime: [null as string | null, [Validators.required]],
        toDate: [null as Date | null, [Validators.required]],
        toTime: [null as string | null, [Validators.required]],
        group1: [{ sensors: [] } as SensorGroup, [Validators.required]],
        group2: [{ sensors: [] } as SensorGroup, [Validators.required]],
      },
      { validators: this.dateRangeValidator }
    )
  }

  onCompute(): void {
    this.errorMessage = undefined
    this.resultsGroup1 = this.resultsGroup2 = undefined
    this.correlation = undefined

    this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true })
    this.form.markAllAsTouched()

    // if (this.form.invalid) {
    //   this.errorMessage = 'Bitte komplettes Zeitintervall auswählen und Gruppen füllen.';
    //   return;
    // }

    if (!this.validateGroups() || !this.validateForm()) {
      return
    }
    const { from, to } = this.getIsoRange()
    this.fetchStatisticsAndCorrelation(from, to)
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
  }

  get fromDateCtrl() {
    return this.form.get('fromDate') as FormControl<Date | null>
  }
  get fromTimeCtrl() {
    return this.form.get('fromTime') as FormControl<string | null>
  }
  get toDateCtrl() {
    return this.form.get('toDate') as FormControl<Date | null>
  }
  get toTimeCtrl() {
    return this.form.get('toTime') as FormControl<string | null>
  }

  /** Typed Getter für Sensorgruppe 1 */
  get group1Ctrl(): FormControl<SensorGroup> {
    return this.form.get('group1') as FormControl<SensorGroup>
  }

  get group2Ctrl(): FormControl<SensorGroup> {
    return this.form.get('group2') as FormControl<SensorGroup>
  }

  /**
   * Validator: ensures from-date/time ≤ to-date/time.
   */
  private dateRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const g = group as FormGroup
    const fromDate = g.get('fromDate')!.value as Date | null
    const fromTime = g.get('fromTime')!.value as string | null
    const toDate = g.get('toDate')!.value as Date | null
    const toTime = g.get('toTime')!.value as string | null

    if (fromDate && fromTime && toDate && toTime) {
      const from = this.combineDateTime(fromDate, fromTime)
      const to = this.combineDateTime(toDate, toTime)
      if (from > to) {
        return { dateRangeInvalid: true }
      }
    }
    return null
  }

  private combineDateTime(date: Date, time: string): Date {
    const [h, m] = time.split(':').map(Number)
    const copy = new Date(date)
    copy.setHours(h, m, 0, 0)
    return copy
  }

  /** Ensure both groups have at least one measurement selected */
  private validateGroups(): boolean {
    if (this.group1Ctrl.value.sensors.length === 0 || this.group2Ctrl.value.sensors.length === 0) {
      this.errorMessage = 'Bitte mindestens einen Measurement pro Gruppe auswählen.'
      return false
    }
    return true
  }

  /** Ensure all date/time fields are valid and in correct order */
  private validateForm(): boolean {
    if (this.form.invalid) {
      this.errorMessage = 'Bitte komplettes Zeitintervall auswählen'
      return false
    }
    return true
  }

  /** Returns ISO strings for “from” and “to” combined date/time */
  private getIsoRange(): { from: string; to: string } {
    const fromDate = this.fromDateCtrl.value!
    const fromTime = this.fromTimeCtrl.value!
    const toDate = this.toDateCtrl.value!
    const toTime = this.toTimeCtrl.value!
    return {
      from: this.combineDateTime(fromDate, fromTime).toISOString(),
      to: this.combineDateTime(toDate, toTime).toISOString(),
    }
  }
}
