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
import { SensorData } from '../../models/sensorData.model'
import { SavedTable } from '../../models/savedTable.model'

/**
 * Component that renders a table of sensor measurements with filtering and pagination.
 *
 * @export
 * @class MeasurementTableComponent
 * @implements {OnInit}
 * @implements {AfterViewInit}
 */
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
  /**
   * Configuration and data for the table passed from parent component.
   * @type {SavedTable}
   */
  @Input() table!: SavedTable
  /**
   * Event emitted when the user requests to remove the table.
   * Emits the table ID as a string.
   * @type {EventEmitter<string>}
   */
  @Output() remove = new EventEmitter<string>()

  /**
   * Data source for the Material table, wrapping an array of SensorData.
   */
  dataSource: MatTableDataSource<SensorData> = new MatTableDataSource<SensorData>([])
  /**
   * Columns to display in the table.
   */
  displayedColumns = ['timestamp', 'value']
  /**
   * Current filter operator ('>', '<', '=' or empty).
   */
  filterOperator = ''
  filterValue = ''

  /**
   * Reference to the Material paginator component.
   */
  @ViewChild(MatPaginator) paginator!: MatPaginator

  /**
   * Lifecycle hook that initializes the component.
   * Sets up the data source and filter predicate.
   * @memberof MeasurementTableComponent
   */
  ngOnInit(): void {
    this.dataSource.data = this.table.data.dataPoints
    this.dataSource.filterPredicate = this.filterPredicate()
  }

  /**
   * Provides a predicate function for filtering table rows.
   * Splits the filter string into operator and value, compares accordingly.
   *
   * @private
   * @returns {(data: SensorData, filter: string) => boolean}
   *   Filter predicate function.
   * @memberof MeasurementTableComponent
   */
  private filterPredicate(): (data: SensorData, filter: string) => boolean {
    return (data, filter) => {
      const [operator, valueStr] = filter.split(':')
      const value = parseFloat(valueStr)
      if (isNaN(value)) return true
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

  /**
   * Lifecycle hook called after the view has been initialized.
   * Connects the paginator to the table's data source.
   *
   * @memberof MeasurementTableComponent
   */
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator
  }

  /**
   * Applies the current filter operator and value to the table.
   * Resets filter if operator or value is missing.
   *
   * @memberof MeasurementTableComponent
   */
  applyFilter(): void {
    if (this.filterOperator && this.filterValue) {
      this.dataSource.filter = `${this.filterOperator}:${this.filterValue}`
    } else {
      this.dataSource.filter = ''
    }
  }

  /**
   * Emits a remove event with the table's ID.
   * Called when the user clicks the remove button.
   *
   * @memberof MeasurementTableComponent
   */
  removeTable(): void {
    this.remove.emit(this.table.id)
  }
}
