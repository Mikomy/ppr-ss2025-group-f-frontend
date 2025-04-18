import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnInit,
  AfterViewInit,
} from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator } from '@angular/material/paginator'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { MatInputModule } from '@angular/material/input'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { Measurement } from '../../models/measurement.model'
import { SensorData } from '../../models/sensorData.model'

interface SavedTable {
  id: string
  name: string
  from?: string
  to?: string
  data: Measurement
}

@Component({
  selector: 'app-measurement-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './measurement-table.component.html',
  styleUrl: './measurement-table.component.scss',
})
export class MeasurementTableComponent implements OnInit, AfterViewInit {
  @Input() table!: SavedTable
  @Output() remove = new EventEmitter<string>()

  dataSource: MatTableDataSource<SensorData> = new MatTableDataSource<SensorData>([])
  displayedColumns = ['timestamp', 'value']
  filterOperator = ''
  filterValue = ''

  @ViewChild(MatPaginator) paginator!: MatPaginator

  ngOnInit(): void {
    this.dataSource.data = this.table.data.dataPoints
    this.dataSource.filterPredicate = (data: SensorData, filter: string) => {
      const [operator, valueStr] = filter.split(':')
      const value = parseFloat(valueStr)
      if (isNaN(value)) return true // Keine Filterung bei ungültigem Wert
      switch (operator) {
        case '>':
          return data.value > value
        case '<':
          return data.value < value
        case '=':
          return data.value === value
        default:
          return true
      }
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  applyFilter(): void {
    if (this.filterOperator && this.filterValue) {
      this.dataSource.filter = `${this.filterOperator}:${this.filterValue}`
    } else {
      this.dataSource.filter = '' // Filter zurücksetzen, wenn Eingaben fehlen
    }
  }

  removeTable(): void {
    this.remove.emit(this.table.id)
  }
}
