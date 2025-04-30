import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  ValidationErrors,
} from '@angular/forms'
import { StatsService } from '../../components/statistics/stats.service'
import { SensorGroup, StatisticResult } from '../../models/stats.model'
import { StatisticsDisplayComponent } from '../../components/statistics/statistics-display/statistics-display.component'
import { CommonModule } from '@angular/common'
import { SensorGroupSelectorComponent } from '../../shared/sensor-group-selector/sensor-group-selector.component'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { forkJoin } from 'rxjs'

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
  ],

  templateUrl: './statistics-page.component.html',
  styleUrl: './statistics-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsPageComponent implements OnInit {
  form!: FormGroup
  results1?: StatisticResult
  results2?: StatisticResult
  correlation?: number

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

  private dateRangeValidator(group: FormGroup): ValidationErrors | null {
    const from = group.get('from')?.value as Date | string | null
    const to = group.get('to')?.value as Date | string | null
    if (from && to && new Date(from) > new Date(to)) {
      return { dateRangeInvalid: true }
    }
    return null
  }

  onCompute(): void {
    const fromDate = this.combineDateTime(this.fromDateCtrl.value!, this.fromTimeCtrl.value!)
    const toDate = this.combineDateTime(this.toDateCtrl.value!, this.toTimeCtrl.value!)

    forkJoin({
      r1: this.stats.computeStats(this.group1Ctrl.value, fromDate, toDate),
      r2: this.stats.computeStats(this.group2Ctrl.value, fromDate, toDate),
      corr: this.stats.computeCorrelation(
        this.group1Ctrl.value,
        this.group2Ctrl.value,
        fromDate,
        toDate
      ),
    }).subscribe(({ r1, r2, corr }) => {
      this.results1 = r1
      this.results2 = r2
      this.correlation = corr
    })
  }
  private combineDateTime(date: Date, time: string): Date {
    const [h, m] = time.split(':').map(Number)
    const d = new Date(date)
    d.setHours(h, m, 0, 0)
    return d
  }
}
