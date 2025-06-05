import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatIconModule } from '@angular/material/icon'
import { SensorDropdownComponent } from '../../../shared/sensor-dropdown/sensor-dropdown.component'
import { DropdownOptionModel } from '../../../models/dropdown.option.model'

export type ChartType = 'line' | 'bar'

export interface ChartConfig {
  measurement?: DropdownOptionModel
  color: string
  chartType: ChartType
}
@Component({
  selector: 'app-chart-config-row',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatIconModule,
    SensorDropdownComponent,
  ],
  templateUrl: './chart-config-row.component.html',
  styleUrl: './chart-config-row.component.scss',
})
export class ChartConfigRowComponent {
  @Input() config!: ChartConfig
  @Output() configChange = new EventEmitter<ChartConfig>()

  /**
   * Emits the updated config object to the parent component.
   */
  private emitChange() {
    this.configChange.emit({ ...this.config })
  }

  /**
   * Handler when a measurement option is selected from the dropdown.
   *
   * @param option The selected DropdownOptionModel
   */
  onMeasurementSelected(option: DropdownOptionModel) {
    console.log('Measurement selected:', option)
    this.config.measurement = option
    this.emitChange()
  }

  /**
   * Handler when the color picker value changes.
   *
   * @param event The input event from the color picker
   */
  onColorChange(event: Event) {
    const input = event.target as HTMLInputElement
    this.config.color = input.value
    this.emitChange()
  }

  /**
   * Handler when the chart type (line or bar) is toggled.
   *
   * @param type The selected chart type ('line' or 'bar')
   */
  onTypeChange(type: ChartType) {
    this.config.chartType = type
    this.emitChange()
  }
}
