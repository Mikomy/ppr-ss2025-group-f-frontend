import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { TableViewPageComponent } from '../../pages/tableView-page/tableView-page.component'
import { BackendService } from '../../services/backend.service'
import { WebStorageService } from '../../services/webStorage.service'
import { DropdownOptionModel } from '../../models/dropdown.option.model'
import { Measurement } from '../../models/measurement.model'
import { of, throwError } from 'rxjs'
import { FormsModule } from '@angular/forms'

describe('TabellenansichtPageComponent', () => {
  let fixture: ComponentFixture<TableViewPageComponent>
  let component: TableViewPageComponent
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
    bSpy.getDropdownOption.and.returnValue(of([]))

    const sSpy = jasmine.createSpyObj('WebStorageService', ['get', 'set'])

    await TestBed.configureTestingModule({
      imports: [FormsModule, TableViewPageComponent],
      providers: [
        { provide: BackendService, useValue: bSpy },
        { provide: WebStorageService, useValue: sSpy },
      ],
    }).compileComponents()

    backendSpy = TestBed.inject(BackendService) as jasmine.SpyObj<BackendService>
    storageSpy = TestBed.inject(WebStorageService) as jasmine.SpyObj<WebStorageService>
  })

  beforeEach(() => {
    storageSpy.get.and.returnValue(null)
    fixture = TestBed.createComponent(TableViewPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('lädt savedTables aus Storage', () => {
    expect(storageSpy.get).toHaveBeenCalledWith('saved-sensor-tables')
    expect(component.savedTables).toEqual([])
  })

  it('onSelectionChange setzt Felder zurück', () => {
    component.fromDate = new Date()
    component.toTime = '12:00'
    component.errorMessage = 'Foo'
    component.onSelectionChange(dummyOption)

    expect(component.selectedOption).toBe(dummyOption)
    expect(component.fromDate).toBeUndefined()
    expect(component.toTime).toBeUndefined()
    expect(component.errorMessage).toBeUndefined()
  })

  it('zeigt Fehlermeldung, wenn Eingaben fehlen', () => {
    component.loadDetailedMeasurement()
    expect(component.errorMessage).toBe('Bitte wählen Sie Sensor, Datum und Uhrzeit aus.')
  })

  it('lädt Messung und fügt Tabelle hinzu (Erfolg)', fakeAsync(() => {
    component.selectedOption = dummyOption
    component.fromDate = new Date('2025-04-10')
    component.fromTime = '08:30'
    component.toDate = new Date('2025-04-10')
    component.toTime = '09:30'
    backendSpy.getMeasurement.and.returnValue(of(dummyMeasurement))

    component.loadDetailedMeasurement()
    tick()

    expect(component.savedTables.length).toBe(1)
    expect(component.savedTables[0].data).toEqual(dummyMeasurement)
    expect(storageSpy.set).toHaveBeenCalledWith(
      'saved-sensor-tables',
      JSON.stringify(component.savedTables)
    )
  }))

  it('setzt Fehlermeldung bei Backend‑Fehler', fakeAsync(() => {
    component.selectedOption = dummyOption
    component.fromDate = new Date('2025-04-10')
    component.fromTime = '08:30'
    component.toDate = new Date('2025-04-10')
    component.toTime = '09:30'
    backendSpy.getMeasurement.and.returnValue(throwError(() => new Error('X')))

    component.loadDetailedMeasurement()
    tick()

    expect(component.errorMessage).toBe('Fehler beim Laden der Daten.')
    expect(component.savedTables).toEqual([])
  }))

  it('removeTable löscht Eintrag und updated Storage', () => {
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
