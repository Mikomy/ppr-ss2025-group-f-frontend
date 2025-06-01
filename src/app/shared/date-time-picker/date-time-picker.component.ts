import { MatFormFieldControl } from '@angular/material/form-field'

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  LOCALE_ID,
  Output,
} from '@angular/core'
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
import { QuickRangeKey } from '../../models/quickRange.enum'

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
  @Output() quickRangeChange = new EventEmitter<QuickRangeKey | null>()

  rangeForm: FormGroup
  private onTouched!: () => void
  private onChangeFn!: (value: DateTimeRange) => void
  private onValidatorChange!: () => void
  // quickRange: QuickRangeKey | null = null;
  readonly minDate = new Date(2025, 0, 1)

  constructor(private fb: FormBuilder) {
    this.rangeForm = this.fb.group(
      {
        fromDate: [null],
        fromTime: [null],
        toDate: [null],
        toTime: [null],
      },
      { validators: [this.dateRangeValidator.bind(this)] }
    )
    this.rangeForm.valueChanges.subscribe(() => {
      if (this.rangeForm.dirty) {
        this.onChangeFn(this.rangeForm.value)
        this.onTouched()
        this.onValidatorChange?.()
      }
    })
  }

  /** Write an incoming value to the form controls without emitting change events. */
  writeValue(obj: DateTimeRange): void {
    if (obj) {
      this.rangeForm.setValue(obj, { emitEvent: false })
    } else {
      // obj == null → komplett zurücksetzen
      this.rangeForm.reset(
        {
          fromDate: null,
          fromTime: null,
          toDate: null,
          toTime: null,
        },
        { emitEvent: false }
      )
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

  /**
   * Performs validation on the inner FormGroup and returns any errors.
   */
  validate(): ValidationErrors | null {
    if (!this.rangeForm.dirty) {
      return null
    }
    return this.rangeForm.errors
  }

  /**
   * Combines a Date and a time string "HH:mm" into a single Date instance.
   */
  private combine(date: Date, time: string): Date {
    const [h, m] = time.split(':').map(Number)
    const d = new Date(date)
    d.setHours(h, m, 0, 0)
    return d
  }

  /**
   * Custom validator to ensure complete range, valid order and minDate.
   */
  private dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    if (!group.dirty) {
      return null
    }
    const { fromDate, fromTime, toDate, toTime } = group.value as DateTimeRange
    if (!fromDate || !fromTime || !toDate || !toTime) {
      return { required: true }
    }
    const from = this.combine(fromDate, fromTime)
    const to = this.combine(toDate, toTime)
    if (from > to) {
      return { rangeInvalid: true }
    }
    if (from < this.minDate) {
      return { dateTooEarly: true }
    }
    return null
  }
}
