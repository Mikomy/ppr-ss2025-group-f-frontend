import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator'
import { FormsModule } from '@angular/forms'

import { MeasurementTableComponent } from './measurement-table.component'
import { SensorData } from '../../models/sensorData.model'
import { SavedTable } from '../../models/savedTable.model'

describe('MeasurementTableComponent', () => {
  let component: MeasurementTableComponent
  let fixture: ComponentFixture<MeasurementTableComponent>

  const mockTable: SavedTable = {
    id: 't1',
    name: 'Test Table',
    label: [''],
    data: {
      measurementName: 'Test',
      sensor: { id: 's1', name: 'Sensor1', location: 'Loc' },
      dataPoints: [
        { timestamp: '2025-04-01T00:00:00Z', value: 10 },
        { timestamp: '2025-04-01T00:30:00Z', value: 20 },
      ],
    },
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementTableComponent, MatTableModule, MatPaginatorModule, FormsModule],
    }).compileComponents()

    fixture = TestBed.createComponent(MeasurementTableComponent)
    component = fixture.componentInstance
    component.table = mockTable
    fixture.detectChanges()
  })

  it('should initialize dataSource and filterPredicate on init', () => {
    component.ngOnInit()
    expect(component.dataSource.data).toEqual(mockTable.data.dataPoints)
    expect(typeof component.dataSource.filterPredicate).toBe('function')
  })

  it('should assign paginator after view init', () => {
    component.ngAfterViewInit()
    expect(component.dataSource.paginator).toBeDefined()
  })

  describe('applyFilter', () => {
    beforeEach(() => component.ngOnInit())

    it('applies > filter correctly', () => {
      component.filterOperator = '>'
      component.filterValue = '15'
      component.applyFilter()

      expect(component.dataSource.filteredData).toEqual([
        { timestamp: '2025-04-01T00:30:00Z', value: 20 },
      ] as SensorData[])
    })

    it('applies < filter correctly', () => {
      component.filterOperator = '<'
      component.filterValue = '15'
      component.applyFilter()

      expect(component.dataSource.filteredData).toEqual([
        { timestamp: '2025-04-01T00:00:00Z', value: 10 },
      ] as SensorData[])
    })

    it('applies = filter correctly', () => {
      component.filterOperator = '='
      component.filterValue = '10'
      component.applyFilter()

      expect(component.dataSource.filteredData).toEqual([
        { timestamp: '2025-04-01T00:00:00Z', value: 10 },
      ] as SensorData[])
    })

    it('clears filter if incomplete', () => {
      component.filterOperator = ''
      component.filterValue = ''
      component.applyFilter()

      expect(component.dataSource.filteredData.length).toBe(2)
    })
  })

  it('removeTable emits remove event with table id', () => {
    spyOn(component.remove, 'emit')
    component.removeTable()
    expect(component.remove.emit).toHaveBeenCalledWith(mockTable.id)
  })
})
