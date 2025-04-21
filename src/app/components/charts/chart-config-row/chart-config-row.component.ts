import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatIconModule } from '@angular/material/icon'
import { SensorDropdownComponent } from '../../../shared/sensor-dropdown/sensor-dropdown.component'
import { DropdownOptionModel } from '../../../models/dropdown.option.model'

export type ChartType = 'line' | 'bar' | 'heatmap'

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

  /** Emit updated config */
  private emitChange() {
    this.configChange.emit({ ...this.config })
  }

  /** Handler when measurement selected */
  onMeasurementSelected(option: DropdownOptionModel) {
    console.log('Measurement selected:', option)
    this.config.measurement = option
    this.emitChange()
  }

  /** Hadler when color picker changes */
  onColorChange(event: Event) {
    const input = event.target as HTMLInputElement
    this.config.color = input.value
    this.emitChange()
  }

  /** Handler when chart type toggled */
  onTypeChange(type: ChartType) {
    this.config.chartType = type
    this.emitChange()
  }
}
