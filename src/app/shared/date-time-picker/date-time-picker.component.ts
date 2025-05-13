import { MatFormFieldControl } from '@angular/material/form-field'

import { ChangeDetectionStrategy, Component, forwardRef, LOCALE_ID } from '@angular/core'
import { CommonModule, registerLocaleData } from '@angular/common'
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
  NG_VALIDATORS,
  Validator,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatDatepickerModule } from '@angular/material/datepicker'
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
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
export interface DateTimeRange {
  fromDate: Date | null
  fromTime: string | null
  toDate: Date | null
  toTime: string | null
}
@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de-AT' },
    { provide: MAT_DATE_LOCALE, useValue: 'de-AT' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {
      provide: MatFormFieldControl,
      useExisting: DateTimePickerComponent,
    },
    { provide: MAT_DATE_FORMATS, useValue: DD_MM_YYYY_FORMATS },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true,
    },
  ],
  templateUrl: './date-time-picker.component.html',
  styleUrl: './date-time-picker.component.scss',
})
export class DateTimePickerComponent implements ControlValueAccessor, Validator {
  rangeForm: FormGroup
  private onTouched!: () => void
  private onChangeFn!: (value: DateTimeRange) => void
  private onValidatorChange!: () => void

  constructor(private fb: FormBuilder) {
    this.rangeForm = this.fb.group({
      fromDate: [null],
      fromTime: [null],
      toDate: [null],
      toTime: [null],
    })
    this.rangeForm.valueChanges.subscribe((val) => {
      if (this.rangeForm.dirty && this.rangeForm.valid) {
        this.onChangeFn(val)
        this.onTouched()
        this.onValidatorChange?.()
      }
    })
  }

  writeValue(obj: DateTimeRange): void {
    if (obj) {
      this.rangeForm.setValue(obj, { emitEvent: false })
    }
  }

  registerOnChange(fn: (value: DateTimeRange) => void): void {
    this.onChangeFn = fn
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }
  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.rangeForm.disable()
    } else {
      this.rangeForm.enable()
    }
  }
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn
  }
  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value as DateTimeRange
    const { fromDate, fromTime, toDate, toTime } = value || {}
    if (!fromDate || !fromTime || !toDate || !toTime) {
      return { required: true }
    }
    const from = this.combine(fromDate, fromTime)
    const to = this.combine(toDate, toTime)
    return from > to ? { rangeInvalid: true } : null
  }

  private combine(date: Date, time: string): Date {
    const [h, m] = time.split(':').map(Number)
    const d = new Date(date)
    d.setHours(h, m, 0, 0)
    return d
  }

  setLastWeek(): void {
    this.applyQuickRange(7)
  }
  setLast30Days(): void {
    this.applyQuickRange(30)
  }
  setLast60Days(): void {
    this.applyQuickRange(60)
  }

  private applyQuickRange(days: number) {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - days)
    this.rangeForm.setValue(
      {
        fromDate: start,
        fromTime: this.padTime(start),
        toDate: now,
        toTime: this.padTime(now),
      },
      { emitEvent: false }
    )
    if (this.rangeForm.valid) {
      this.onChangeFn(this.rangeForm.value)
      this.onValidatorChange?.()
    }
  }
  private padTime(date: Date): string {
    const h = date.getHours().toString().padStart(2, '0')
    const m = date.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  }
}
