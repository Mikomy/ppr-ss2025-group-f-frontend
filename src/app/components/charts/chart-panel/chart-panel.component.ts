import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { ChartHostComponent } from '../chart-host/chart-host.component'
import { SavedChart } from '../../../models/savedChart.model'

@Component({
  selector: 'app-chart-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    DragDropModule,
    ChartHostComponent,
  ],
  templateUrl: './chart-panel.component.html',
  styleUrl: './chart-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartPanelComponent {
  /** Konfiguration des Charts, inkl. Typ, Farben und Datenserien */
  @Input() config!: SavedChart & { chartType: 'line' | 'bar' | 'heatmap' }
  @Output() remove = new EventEmitter<string>()

  /** Entfernt dieses Panel */
  onRemove(): void {
    this.remove.emit(this.config.id)
  }
}
