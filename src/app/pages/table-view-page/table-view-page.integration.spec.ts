import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing'
import { of } from 'rxjs'

import { TableViewPageComponent } from './table-view-page.component'
import { BackendService } from '../../services/backend.service'
import { WebStorageService } from '../../services/webStorage.service'
import { DropdownOptionModel } from '../../models/dropdown.option.model'
import { Measurement } from '../../models/measurement.model'
import { QuickRangeKey } from '../../models/quickRange.enum'
import { MeasurementTableComponent } from '../../shared/measurement-table/measurement-table.component'
import { DateTimePickerComponent } from '../../shared/date-time-picker/date-time-picker.component'
import { SensorDropdownComponent } from '../../shared/sensor-dropdown/sensor-dropdown.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'

describe('TableViewPageComponent – Integration Tests', () => {
  let fixture: ComponentFixture<TableViewPageComponent>
  let component: TableViewPageComponent
  let backendSpy: jasmine.SpyObj<BackendService>
  let storageSpy: jasmine.SpyObj<WebStorageService>

  // Dummy dropdown option to simulate a sensor + measurement
  const dummyOption: DropdownOptionModel = {
    measurementName: 'Soil Moisture',
    sensor: { id: '1', name: 'Sensor A', location: 'Field' },
    alias: 'alias1',
  }

  // Dummy measurement data returned by the backend
  const dummyMeasurement: Measurement = {
    measurementName: 'Soil Moisture',
    sensor: dummyOption.sensor,
    dataPoints: [
      { timestamp: '2025-04-01T00:00:00Z', value: 42 },
      { timestamp: '2025-04-01T01:00:00Z', value: 43 },
    ],
  }

  beforeEach(waitForAsync(() => {
    // Create spy objects for BackendService and WebStorageService
    backendSpy = jasmine.createSpyObj<BackendService>('BackendService', [
      'getDropdownOption',
      'getGroupedByAlias',
    ])
    storageSpy = jasmine.createSpyObj<WebStorageService>('WebStorageService', ['get', 'set'])

    // By default, return null for saved tables
    storageSpy.get.and.returnValue(null)
    // By default, return an empty array for dropdown options
    backendSpy.getDropdownOption.and.returnValue(of([]))

    TestBed.configureTestingModule({
      imports: [
        TableViewPageComponent,
        SensorDropdownComponent,
        DateTimePickerComponent,
        MeasurementTableComponent,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
      ],
      providers: [
        { provide: BackendService, useValue: backendSpy },
        { provide: WebStorageService, useValue: storageSpy },
      ],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TableViewPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges() // triggers ngOnInit
  })

  it('should load saved tables from WebStorage on init and render no measurement tables', () => {
    expect(storageSpy.get).toHaveBeenCalledWith('saved-sensor-tables')
    expect(component.savedTables).toEqual([])

    // There should be no <app-measurement-table> rendered initially
    const renderedTables = fixture.nativeElement.querySelectorAll('app-measurement-table')
    expect(renderedTables.length).toBe(0)
  })

  it('should render SensorDropdown and, after selecting a sensor, show DateTimePicker and Quick-Range buttons', () => {
    // Initially, SensorDropdown is present
    const dropdownElement = fixture.nativeElement.querySelector('app-sensor-dropdown')
    expect(dropdownElement).toBeTruthy()

    // DateTimePicker and Quick-Range buttons should not yet be visible
    expect(fixture.nativeElement.querySelector('app-date-time-picker')).toBeNull()
    const quickButtonsInitial = fixture.nativeElement.querySelectorAll('.quick-select-btn')
    expect(quickButtonsInitial.length).toBe(0)

    // Simulate selecting a sensor from SensorDropdown
    component.onSelectionChange(dummyOption)
    fixture.detectChanges()

    // Now DateTimePicker should be rendered
    expect(fixture.nativeElement.querySelector('app-date-time-picker')).toBeTruthy()

    // And three quick-range buttons should appear
    const quickButtonsAfter = fixture.nativeElement.querySelectorAll('.quick-select-btn')
    expect(quickButtonsAfter.length).toBe(3)
  })

  it('Quick-Range "Last Week" ruft Service mit LAST_WEEK auf und rendert genau eine Tabelle', fakeAsync(() => {
    component.onSelectionChange(dummyOption)
    fixture.detectChanges()

    let capturedTimeRange: QuickRangeKey | undefined
    backendSpy.getGroupedByAlias.and.callFake(
      (_alias: string, _fromIso?: string, _toIso?: string, timeRange?: QuickRangeKey) => {
        capturedTimeRange = timeRange
        return of([dummyMeasurement])
      }
    )

    const quickBtnEls: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button.quick-select-btn')
    expect(quickBtnEls.length).toBe(3, 'Es müssen genau 3 Quick-Range-Buttons vorhanden sein')
    quickBtnEls[0].click()
    tick()
    fixture.detectChanges()

    expect(capturedTimeRange).toBe(QuickRangeKey.LAST_WEEK)

    const renderedTables = fixture.nativeElement.querySelectorAll('app-measurement-table')
    expect(renderedTables.length).toBe(
      1,
      'Genau eine MeasurementTableComponent soll gerendert werden'
    )
  }))

  it('Quick-Range "Last Week" ruft Service mit LAST_WEEK auf und rendert genau eine Tabelle', fakeAsync(() => {
    component.onSelectionChange(dummyOption)
    fixture.detectChanges()

    let capturedTimeRange: QuickRangeKey | undefined
    backendSpy.getGroupedByAlias.and.callFake(
      (alias: string, fromIso?: string, toIso?: string, timeRange?: QuickRangeKey) => {
        capturedTimeRange = timeRange
        return of([dummyMeasurement])
      }
    )

    const quickBtnEls: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button.quick-select-btn')
    expect(quickBtnEls.length).toBe(3, 'Es müssen genau 3 Quick-Range-Buttons vorhanden sein')
    quickBtnEls[0].click()
    tick()
    fixture.detectChanges()

    expect(capturedTimeRange).toBe(QuickRangeKey.LAST_WEEK)

    const renderedTables = fixture.nativeElement.querySelectorAll('app-measurement-table')
    expect(renderedTables.length).toBe(
      1,
      'Genau eine MeasurementTableComponent soll gerendert werden'
    )
  }))

  it('should remove a table when clicking the remove button and update WebStorage', fakeAsync(() => {
    // 1) Manually add two entries to savedTables
    component.savedTables = [
      { id: '1', name: 'Table A', label: [''], data: dummyMeasurement },
      { id: '2', name: 'Table B', label: [''], data: dummyMeasurement },
    ]
    storageSpy.set.calls.reset()
    fixture.detectChanges()

    // 2) There should be two <app-measurement-table> rendered
    const removeButtons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll(
      'app-measurement-table button[aria-label="Entfernen"]'
    )
    expect(removeButtons.length).toBe(2)

    // 3) Click the first remove button
    removeButtons[0].click()
    tick()
    fixture.detectChanges()

    // 4) savedTables should now have only one item
    expect(component.savedTables.length).toBe(1)
    expect(component.savedTables[0].id).toBe('2')

    // 5) WebStorage.set should have been called with the updated array
    expect(storageSpy.set).toHaveBeenCalledWith(
      'saved-sensor-tables',
      JSON.stringify(component.savedTables)
    )

    // 6) Only one <app-measurement-table> should remain in the DOM
    const remainingTables = fixture.nativeElement.querySelectorAll('app-measurement-table')
    expect(remainingTables.length).toBe(1)
  }))
})
