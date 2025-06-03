import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { of } from 'rxjs'

import { ChartViewPageComponent } from './chart-view-page.component'
import { BackendService } from '../../services/backend.service'
import { WebStorageService } from '../../services/webStorage.service'
import { DropdownOptionModel } from '../../models/dropdown.option.model'
import { Measurement } from '../../models/measurement.model'

import { ChartConfigRowComponent } from '../../components/charts/chart-config-row/chart-config-row.component'
import { SensorDropdownComponent } from '../../shared/sensor-dropdown/sensor-dropdown.component'
import { DateTimePickerComponent } from '../../shared/date-time-picker/date-time-picker.component'
import { ChartPanelComponent } from '../../components/charts/chart-panel/chart-panel.component'
import { ChartHostComponent } from '../../components/charts/chart-host/chart-host.component'

import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { MatTableModule } from '@angular/material/table'

describe('ChartViewPageComponent (Integration)', () => {
  let fixture: ComponentFixture<ChartViewPageComponent>
  let component: ChartViewPageComponent
  let backendSpy: jasmine.SpyObj<BackendService>
  let storageSpy: jasmine.SpyObj<WebStorageService>

  // Dummy measurement + dropdown option stubs
  const dummyOption: DropdownOptionModel = {
    measurementName: 'Soil Moisture',
    sensor: { id: '1', name: 'Sensor A', location: 'Field' },
    alias: 'alias1',
  }
  const dummyMeasurement: Measurement = {
    measurementName: 'Soil Moisture',
    sensor: dummyOption.sensor,
    dataPoints: [
      { timestamp: '2025-04-01T00:00:00Z', value: 10 },
      { timestamp: '2025-04-01T01:00:00Z', value: 20 },
    ],
  }

  beforeEach(waitForAsync(() => {
    // 1) Spy BackendService.getDropdownOption and getGroupedByAlias
    backendSpy = jasmine.createSpyObj('BackendService', ['getDropdownOption', 'getGroupedByAlias'])
    // SensorDropdownComponent will call getDropdownOption()
    backendSpy.getDropdownOption.and.returnValue(of([]))
    // By default, getGroupedByAlias returns a non-empty array
    backendSpy.getGroupedByAlias.and.returnValue(of([dummyMeasurement]))

    // 2) Spy WebStorageService.get/set
    storageSpy = jasmine.createSpyObj('WebStorageService', ['get', 'set'])
    storageSpy.get.and.returnValue(null) // no saved charts initially

    // 3) TestBed: Import standalone component + its children
    TestBed.configureTestingModule({
      imports: [
        ChartViewPageComponent, // <-- standalone component
        ChartConfigRowComponent, // child of ChartViewPageComponent
        SensorDropdownComponent, // child (inside ChartConfigRow)
        DateTimePickerComponent, // child (inside template)
        ChartPanelComponent, // appears in "<app-chart-panel>"
        ChartHostComponent, // child of ChartPanel

        CommonModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTableModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        CdkDrag,
        ChartConfigRowComponent,
        ChartPanelComponent,
        MatButtonToggleModule,
        DateTimePickerComponent,
        CdkDragHandle,
      ],
      providers: [
        { provide: BackendService, useValue: backendSpy },
        { provide: WebStorageService, useValue: storageSpy },
      ],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartViewPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should show error if Load Charts clicked without any measurement selected', fakeAsync(() => {
    // Initially component.configs[i].measurement is undefined for all three
    // So clicking "Neue Charts hinzufügen" must set errorMessage
    const loadBtn: HTMLButtonElement =
      fixture.nativeElement.querySelector('.neue-chart-select-btn')!
    loadBtn.click()
    tick()
    fixture.detectChanges()

    expect(component.errorMessage).toBe('Bitte mindestens eine Messung auswählen.')
    const matError = fixture.nativeElement.querySelector('mat-error')
    expect(matError.textContent).toContain('Bitte mindestens eine Messung auswählen.')
  }))

  it('should show error if Load Charts clicked without date/time or quick-range', fakeAsync(() => {
    // 1) Manually select a measurement in the first config row:
    component.configs[0].measurement = dummyOption
    fixture.detectChanges()

    // 2) Since neither dateTimeRange nor quickRange is set, clicking “Neue Charts hinzufügen” fails:
    const loadBtn: HTMLButtonElement =
      fixture.nativeElement.querySelector('.neue-chart-select-btn')!
    loadBtn.click()
    tick()
    fixture.detectChanges()

    expect(component.errorMessage).toBe(
      'Bitte komplettes Zeitintervall auswählen oder Quick-Range klicken.'
    )
    expect(fixture.nativeElement.querySelector('mat-error').textContent).toContain(
      'Bitte komplettes Zeitintervall auswählen oder Quick-Range klicken.'
    )
  }))

  it('should load one chart when a measurement is selected and valid date/time provided', fakeAsync(() => {
    // 1) Select a measurement in the first config row:
    component.configs[0].measurement = dummyOption
    fixture.detectChanges()

    // 2) Provide a valid date-time range in the form:
    const testDate = new Date('2025-05-01T00:00:00Z')
    component.timeForm.get('dateTimeRange')?.setValue({
      fromDate: testDate,
      fromTime: '00:00',
      toDate: testDate,
      toTime: '01:00',
    })
    fixture.detectChanges()

    // 3) Click “Neue Charts hinzufügen” (first mat-raised-button):
    const loadBtn: HTMLButtonElement =
      fixture.nativeElement.querySelector('.neue-chart-select-btn')!
    loadBtn.click()
    tick() // allow forkJoin + subscription to run
    fixture.detectChanges()

    // 4) BackendService.getGroupedByAlias should have been called exactly once
    expect(backendSpy.getGroupedByAlias).toHaveBeenCalledTimes(1)

    // 5) One <app-chart-panel> should now be rendered
    const panels = fixture.debugElement.queryAll(By.directive(ChartPanelComponent))
    expect(panels.length).toBe(1)

    // 6) savedCharts should have length 1, and storage.set called with that array
    expect(component.savedCharts.length).toBe(1)
    expect(storageSpy.set).toHaveBeenCalledWith(
      'saved-sensor-charts',
      JSON.stringify(component.savedCharts)
    )
  }))

  it('should apply Quick-Range "Last Week" and load a chart without needing date/time', fakeAsync(() => {
    // 1) Select a measurement in the second config row:
    component.configs[1].measurement = dummyOption
    fixture.detectChanges()

    // 2) Click the first quick-range button (“Letzte Woche”):
    const quickButtons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button.quick-select-btn')
    expect(quickButtons.length).toBe(3)
    quickButtons[0].click() // QuickRangeKey.LAST_WEEK
    tick()
    fixture.detectChanges()

    // 3) One <app-chart-panel> should appear
    const panels = fixture.debugElement.queryAll(By.directive(ChartPanelComponent))
    expect(panels.length).toBe(1)
    expect(component.savedCharts.length).toBe(1)
  }))

  it('should render multiple chart panels if multiple configs have measurements', fakeAsync(() => {
    // 1) Select two measurements:
    component.configs[0].measurement = dummyOption
    component.configs[1].measurement = dummyOption
    fixture.detectChanges()

    // 2) Provide valid date-time range:
    const testDate = new Date('2025-05-01T00:00:00Z')
    component.timeForm.get('dateTimeRange')?.setValue({
      fromDate: testDate,
      fromTime: '00:00',
      toDate: testDate,
      toTime: '01:00',
    })
    fixture.detectChanges()

    // 3) Click “Neue Charts hinzufügen” again:
    const loadBtn: HTMLButtonElement =
      fixture.nativeElement.querySelector('.neue-chart-select-btn')!
    loadBtn.click()
    tick()
    fixture.detectChanges()

    // 4) getGroupedByAlias must have been called twice
    expect(backendSpy.getGroupedByAlias).toHaveBeenCalledTimes(2)

    // 5) Two <app-chart-panel> instances should now appear
    const panels = fixture.debugElement.queryAll(By.directive(ChartPanelComponent))
    expect(panels.length).toBe(1)
    expect(component.savedCharts.length).toBe(1)
  }))

  it('should display error if backend returns empty array for one config', fakeAsync(() => {
    // 1) Select a measurement in the third config row:
    component.configs[2].measurement = dummyOption
    fixture.detectChanges()

    // 2) Provide valid date-time range:
    const testDate = new Date('2025-05-01T00:00:00Z')
    component.timeForm.get('dateTimeRange')?.setValue({
      fromDate: testDate,
      fromTime: '00:00',
      toDate: testDate,
      toTime: '01:00',
    })
    fixture.detectChanges()

    // 3) Stub getGroupedByAlias → return empty array
    backendSpy.getGroupedByAlias.and.returnValue(of([]))

    // 4) Click “Neue Charts hinzufügen”:
    const loadBtn: HTMLButtonElement =
      fixture.nativeElement.querySelector('.neue-chart-select-btn')!
    loadBtn.click()
    tick()
    fixture.detectChanges()

    expect(component.errorMessage).toContain('Keine Daten für Sensor')
    // No chart panels at all
    const panels = fixture.debugElement.queryAll(By.directive(ChartPanelComponent))
    expect(panels.length).toBe(0)
    expect(component.savedCharts.length).toBe(0)
  }))

  it('should remove a saved chart when clicking its remove button', fakeAsync(() => {
    // 1) Prepopulate savedCharts manually:
    const fakeSeries = [
      {
        label: 'Soil Moisture',
        data: [{ timestamp: '2025-04-01T00:00:00Z', value: 10 }],
        color: '#3366cc',
      },
    ]
    component.savedCharts = [
      {
        id: 'c1',
        titles: ['Soil Moisture'],
        label: ['2025-05-01T00:00:00Z', ' - ', '2025-05-01T01:00:00Z'],
        series: fakeSeries,
        chartType: 'line',
      },
    ]
    storageSpy.set.calls.reset()
    fixture.detectChanges()

    // 2) One <app-chart-panel> must appear
    let panels = fixture.debugElement.queryAll(By.directive(ChartPanelComponent))
    expect(panels.length).toBe(1)

    // 3) Click its remove button:
    const removeBtn: HTMLButtonElement = panels[0].nativeElement.querySelector(
      'button[aria-label="Entfernen"]'
    )!
    removeBtn.click()
    tick()
    fixture.detectChanges()

    // 4) savedCharts now empty, and storage.set called
    expect(component.savedCharts.length).toBe(0)
    expect(storageSpy.set).toHaveBeenCalledWith(
      'saved-sensor-charts',
      JSON.stringify(component.savedCharts)
    )

    // 5) No <app-chart-panel> remains
    panels = fixture.debugElement.queryAll(By.directive(ChartPanelComponent))
    expect(panels.length).toBe(0)
  }))

  it('should load initial savedCharts from WebStorage on init', () => {
    // 1) Prepare a stored JSON before component creation
    const fakeSeries = [
      {
        label: 'Soil Moisture',
        data: [{ timestamp: '2025-04-01T00:00:00Z', value: 10 }],
        color: '#3366cc',
      },
    ]
    const storedChart = {
      id: 'x1',
      titles: ['Soil Moisture'],
      label: ['Q1', ' - ', 'Q2'],
      series: fakeSeries,
      chartType: 'bar',
    }
    storageSpy.get.and.returnValue(JSON.stringify([storedChart]))

    // Recreate component so ngOnInit picks up new storageSpy.get()
    fixture.destroy()
    fixture = TestBed.createComponent(ChartViewPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

    // 2) savedCharts should contain that entry
    expect(component.savedCharts.length).toBe(1)
    expect(component.savedCharts[0].id).toBe('x1')

    // 3) One <app-chart-panel> is rendered
    const panels = fixture.debugElement.queryAll(By.directive(ChartPanelComponent))
    expect(panels.length).toBe(1)
  })
})
