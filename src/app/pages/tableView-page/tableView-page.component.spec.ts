import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { FormsModule } from '@angular/forms'
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
  }

  const dummyMeasurement: Measurement = {
    measurementName: 'Soil Moisture',
    sensor: dummyOption.sensor,
    dataPoints: [{ timestamp: '2025-04-01T00:00:00Z', value: 42 }],
  }

  beforeEach(async () => {
    const bSpy = jasmine.createSpyObj('BackendService', ['getMeasurement', 'getDropdownOption'])
    const sSpy = jasmine.createSpyObj('WebStorageService', ['get', 'set'])

    await TestBed.configureTestingModule({
      imports: [FormsModule, TableViewPageComponent],
      providers: [
        { provide: BackendService, useValue: bSpy },
        { provide: WebStorageService, useValue: sSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    backendSpy = TestBed.inject(BackendService) as jasmine.SpyObj<BackendService>
    storageSpy = TestBed.inject(WebStorageService) as jasmine.SpyObj<WebStorageService>
  })

  beforeEach(() => {
    storageSpy.get.and.returnValue(null)
    backendSpy.getDropdownOption.and.returnValue(of([]))

    fixture = TestBed.createComponent(TableViewPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges() // ngOnInit
  })

  it('should load savedTables from storage on init', () => {
    expect(storageSpy.get).toHaveBeenCalledWith('saved-sensor-tables')
    expect(component.savedTables).toEqual([])
  })

  it('onSelectionChange should reset fields and set selectedOption', () => {
    component.fromDate = new Date()
    component.fromTime = '10:00'
    component.toDate = new Date()
    component.toTime = '11:00'
    component.errorMessage = 'Error'

    component.onSelectionChange(dummyOption)

    expect(component.selectedOption).toBe(dummyOption)
    expect(component.fromDate).toBeUndefined()
    expect(component.fromTime).toBeUndefined()
    expect(component.toDate).toBeUndefined()
    expect(component.toTime).toBeUndefined()
    expect(component.errorMessage).toBeUndefined()
  })

  it('loadDetailedMeasurement should set errorMessage if inputs are missing', () => {
    component.selectedOption = undefined

    component.loadDetailedMeasurement()

    expect(component.errorMessage).toBe('Bitte wählen Sie Sensor, Datum und Uhrzeit aus.')
    expect(backendSpy.getMeasurement).not.toHaveBeenCalled()
  })

  it('loadDetailedMeasurement should call backend and add table on success', fakeAsync(() => {
    component.selectedOption = dummyOption
    component.fromDate = new Date('2025-04-10')
    component.fromTime = '08:30'
    component.toDate = new Date('2025-04-10')
    component.toTime = '09:30'

    backendSpy.getMeasurement.and.returnValue(of(dummyMeasurement))

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
  }))

  it('loadDetailedMeasurement should set errorMessage on backend error', fakeAsync(() => {
    component.selectedOption = dummyOption
    component.fromDate = new Date('2025-04-10')
    component.fromTime = '08:30'
    component.toDate = new Date('2025-04-10')
    component.toTime = '09:30'

    backendSpy.getMeasurement.and.returnValue(throwError(() => new Error('Network')))

    component.loadDetailedMeasurement()
    tick()

    expect(component.errorMessage).toBe('Fehler beim Laden der Daten.')
    expect(component.savedTables).toEqual([])
  }))

  it('removeTable should remove entry and update storage', () => {
    component.savedTables = [
      { id: '1', name: 'A', from: '', to: '', data: dummyMeasurement },
      { id: '2', name: 'B', from: '', to: '', data: dummyMeasurement },
    ]

    component.removeTable('1')

    expect(component.savedTables).toEqual([jasmine.objectContaining({ id: '2' })])
    expect(storageSpy.set).toHaveBeenCalledWith(
      'saved-sensor-tables',
      JSON.stringify(component.savedTables)
    )
  })
})
