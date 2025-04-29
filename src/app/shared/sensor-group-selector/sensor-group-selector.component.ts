import { ChangeDetectionStrategy, Component, forwardRef, Input, OnInit } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { BackendService } from '../../services/backend.service'
import { SensorGroup } from '../../models/stats.model'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { CommonModule } from '@angular/common'

interface SensorOption {
  measurementName: string
  sensorId: string
  display: string
}
@Component({
  selector: 'app-sensor-group-selector',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SensorGroupSelectorComponent),
      multi: true,
    },
  ],
  templateUrl: './sensor-group-selector.component.html',
  styleUrl: './sensor-group-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SensorGroupSelectorComponent implements ControlValueAccessor, OnInit {
  @Input() label = 'Sensorgruppe'
  options: SensorOption[] = []
  selectedOptions: SensorOption[] = []
  disabled = false
  private onChange: (group: SensorGroup) => void = () => {
    /* noop */
  }
  private onTouched: () => void = () => {
    /* noop */
  }

  compareWithFn = (o1: SensorOption, o2: SensorOption) =>
    o1?.sensorId === o2?.sensorId && o1?.measurementName === o2?.measurementName

  constructor(private backend: BackendService) {}

  ngOnInit(): void {
    this.backend.getDropdownOption().subscribe((opts) => {
      this.options = opts.map((o) => ({
        measurementName: o.measurementName,
        sensorId: o.sensor.id,
        display: `${o.measurementName} – ${o.sensor.name}`,
      }))
    })
  }

  writeValue(group: SensorGroup | null): void {
    if (group && group.sensors) {
      this.selectedOptions = this.options.filter((opt) =>
        group.sensors.some(
          (s) => s.sensorId === opt.sensorId && s.measurementName === opt.measurementName
        )
      )
    } else {
      this.selectedOptions = []
    }
  }

  registerOnChange(fn: (group: SensorGroup) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  trackBySensor(_: number, opt: SensorOption): string {
    return `${opt.sensorId}|${opt.measurementName}`
  }
  onSelectionChange(opts: SensorOption[]): void {
    this.selectedOptions = opts
    const group: SensorGroup = {
      sensors: opts.map((o) => ({
        measurementName: o.measurementName,
        sensorId: o.sensorId,
      })),
    }
    this.onChange(group)
  }

  /** Blurring signalisiert touched */
  onBlur(): void {
    this.onTouched()
  }
}
