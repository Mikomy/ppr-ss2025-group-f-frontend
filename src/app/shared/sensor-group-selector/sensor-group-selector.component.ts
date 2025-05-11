import { ChangeDetectionStrategy, Component, forwardRef, Input, OnInit } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { BackendService } from '../../services/backend.service'
import { SensorGroup } from '../../models/stats.model'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { CommonModule } from '@angular/common'

interface SensorOption {
  key: string
  measurementName: string
  alias: string
  sensorName: string
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
  selectedKeys: string[] = []
  disabled = false
  private onChange: (group: SensorGroup) => void = () => {
    /* noop */
  }
  private onTouched: () => void = () => {
    /* noop */
  }

  constructor(private backend: BackendService) {}

  ngOnInit(): void {
    this.backend.getDropdownOption().subscribe((opts) => {
      this.options = opts.map((o, i) => ({
        key: i.toString(),
        sensorName: o.sensor.name,
        measurementName: o.measurementName,
        alias: o.alias!,
        display: `${o.measurementName} – ${o.sensor.name}`,
      }))
    })
  }

  writeValue(group: SensorGroup | null): void {
    if (group?.sensors) {
      this.selectedKeys = group.sensors
        .map((s) => {
          const match = this.options.find(
            (opt) => opt.sensorName === s.sensorName && opt.measurementName === s.measurementName
          )
          return match ? match.key : null
        })
        .filter((k): k is string => k !== null)
    } else {
      this.selectedKeys = []
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

  trackByKey(_: number, opt: SensorOption): string {
    return opt.key
  }

  onSelectionChange(keys: string[]): void {
    this.selectedKeys = keys
    const group: SensorGroup = {
      sensors: keys
        .map((key) => this.options.find((opt) => opt.key === key))
        .filter((o): o is SensorOption => !!o)
        .map((o) => ({
          alias: o.alias,
          measurementName: o.measurementName,
          sensorName: o.sensorName,
        })),
    }
    this.onChange(group)
  }

  onBlur(): void {
    this.onTouched()
  }
}
