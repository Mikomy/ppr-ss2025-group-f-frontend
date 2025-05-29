import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { of, throwError } from 'rxjs'

import { TableViewPageComponent } from './tableView-page.component'
import { BackendService } from '../../services/backend.service'
import { WebStorageService } from '../../services/webStorage.service'
import { DropdownOptionModel } from '../../models/dropdown.option.model'
import { Measurement } from '../../models/measurement.model'
import { SavedTable } from '../../models/savedTable.model'

describe('TableViewPageComponent', () => {
  let component: TableViewPageComponent
  let fixture: ComponentFixture<TableViewPageComponent>
  let backendSpy: jasmine.SpyObj<BackendService>
  let storageSpy: jasmine.SpyObj<WebStorageService>

  const dummyOption: DropdownOptionModel = {
    measurementName: 'Soil Moisture',
    sensor: { id: '1', name: 'Sensor A', location: 'Field' },
    alias: 'alias1',
  }
  const dummyMeasurement: Measurement = {
    measurementName: 'Soil Moisture',
    sensor: dummyOption.sensor,
    dataPoints: [{ timestamp: '2025-04-01T00:00:00Z', value: 42 }],
  }

  beforeEach(async () => {
    backendSpy = jasmine.createSpyObj('BackendService', ['getGroupedByAlias', 'getDropdownOption'])
    backendSpy.getDropdownOption.and.returnValue(of([]))
    storageSpy = jasmine.createSpyObj('WebStorageService', ['get', 'set'])
    storageSpy.get.and.returnValue(null)

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, TableViewPageComponent],
      providers: [
        { provide: BackendService, useValue: backendSpy },
        { provide: WebStorageService, useValue: storageSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(TableViewPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should load savedTables from storage on init', () => {
    expect(storageSpy.get).toHaveBeenCalledWith('saved-sensor-tables')
    expect(component.savedTables).toEqual([])
  })

  it('onSelectionChange should set selectedOption and clear error', () => {
    component.errorMessage = 'Err'
    component.onSelectionChange(dummyOption)
    expect(component.selectedOption).toEqual(dummyOption)
    expect(component.errorMessage).toBeUndefined()
  })

  it('loadDetailedMeasurement should error when selection or dateTimeRange missing', () => {
    component.loadDetailedMeasurement()
    expect(component.errorMessage).toBe('Bitte Sensor auswählen.')

    component.selectedOption = dummyOption
    component.loadDetailedMeasurement()
    expect(component.errorMessage).toBe(
      'Bitte komplettes Zeitintervall auswählen oder Quick-Range klicken.'
    )
  })

  it('loadDetailedMeasurement should call backend and add table on success', fakeAsync(() => {
    component.selectedOption = dummyOption
    component.timeForm.get('dateTimeRange')?.setValue({
      fromDate: new Date('2025-04-10'),
      fromTime: '08:30',
      toDate: new Date('2025-04-10'),
      toTime: '09:30',
    })
    backendSpy.getGroupedByAlias.and.returnValue(of([dummyMeasurement]))

    component.loadDetailedMeasurement()
    tick()

    expect(component.savedTables.length).toBe(1)
    const added: SavedTable = component.savedTables[0]
    expect(added.name).toBe('Soil Moisture')
    expect(added.data).toEqual(dummyMeasurement)
    expect(storageSpy.set).toHaveBeenCalledWith(
      'saved-sensor-tables',
      JSON.stringify(component.savedTables)
    )
    expect(component.errorMessage).toBeUndefined()
  }))

  it('loadDetailedMeasurement should set errorMessage on no data', fakeAsync(() => {
    component.selectedOption = dummyOption
    component.timeForm.get('dateTimeRange')?.setValue({
      fromDate: new Date('2025-04-10'),
      fromTime: '08:30',
      toDate: new Date('2025-04-10'),
      toTime: '09:30',
    })
    backendSpy.getGroupedByAlias.and.returnValue(of([]))

    component.loadDetailedMeasurement()
    tick()

    expect(component.errorMessage).toBe(
      'Keine Daten für den ausgewählten Measurement im angegebenen Zeitraum vorhanden.'
    )
    expect(component.savedTables).toEqual([])
  }))

  it('loadDetailedMeasurement should set errorMessage on backend error', fakeAsync(() => {
    component.selectedOption = dummyOption
    component.timeForm.get('dateTimeRange')?.setValue({
      fromDate: new Date('2025-04-10'),
      fromTime: '08:30',
      toDate: new Date('2025-04-10'),
      toTime: '09:30',
    })
    backendSpy.getGroupedByAlias.and.returnValue(throwError(() => new Error('Network')))

    component.loadDetailedMeasurement()
    tick()

    expect(component.errorMessage).toBe(
      'Keine Daten im gewählten Zeitraum für gewählte Measurement vorhanden.'
    )
    expect(component.savedTables).toEqual([])
  }))

  it('removeTable should remove entry and update storage', () => {
    component.savedTables = [
      { id: '1', name: 'A', label: [''], data: dummyMeasurement },
      { id: '2', name: 'B', label: [''], data: dummyMeasurement },
    ]

    component.removeTable('1')

    expect(component.savedTables).toEqual([jasmine.objectContaining({ id: '2' })])
    expect(storageSpy.set).toHaveBeenCalledWith(
      'saved-sensor-tables',
      JSON.stringify(component.savedTables)
    )
  })
})
