import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { of } from 'rxjs'

import { StatisticsPageComponent } from './statistics-page.component'
import { StatsService } from '../../components/statistics/stats.service'
import { WebStorageService } from '../../services/webStorage.service'
import { BackendService } from '../../services/backend.service'
import { SensorGroupSelectorComponent } from '../../shared/sensor-group-selector/sensor-group-selector.component'
import { DateTimePickerComponent } from '../../shared/date-time-picker/date-time-picker.component'
import { AnomalyListComponent } from '../../components/statistics/anomaly-list/anomaly-list.component'
import { ScatterChartComponent } from '../../components/charts/scatter-chart/scatter-chart.component'

import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatIconModule } from '@angular/material/icon'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SensorGroup, StatisticResult } from '../../models/stats.model'
import { Anomaly } from '../../models/anomaly.model'

describe('StatisticsPageComponent (Integration)', () => {
  let fixture: ComponentFixture<StatisticsPageComponent>
  let component: StatisticsPageComponent
  let statsSpy: jasmine.SpyObj<StatsService>
  let storageSpy: jasmine.SpyObj<WebStorageService>
  let backendSpy: jasmine.SpyObj<BackendService>

  // A minimal StatisticResult stub
  const dummyResult: StatisticResult = {
    count: 2,
    mean: 5,
    median: 5,
    min: 2,
    max: 8,
    variance: 9,
    stdDev: 3,
    p25: 3,
    p75: 7,
    iqr: 4,
    trend: 0,
    series: [
      {
        measurementName: 'm1',
        sensorName: 's1',
        points: [
          { x: 1000, y: 2 },
          { x: 2000, y: 8 },
        ],
      },
    ],
  }
  const dummyCorr = 0.75

  beforeEach(waitForAsync(() => {
    // Spy for StatsService
    statsSpy = jasmine.createSpyObj('StatsService', [
      'computeStats',
      'computeCorrelation',
      'detectOutliers',
    ])
    statsSpy.computeStats.and.returnValue(of(dummyResult))
    statsSpy.computeCorrelation.and.returnValue(of(dummyCorr))
    const anomalies: Anomaly[] = [
      { timestamp: new Date(1000), value: 2, type: 'low' },
      { timestamp: new Date(2000), value: 8, type: 'high' },
    ]
    statsSpy.detectOutliers.and.returnValue(of(anomalies))

    // Spy for WebStorageService
    storageSpy = jasmine.createSpyObj('WebStorageService', ['get', 'set'])
    storageSpy.get.and.returnValue(null)

    // Spy for BackendService, used by SensorGroupSelectorComponent
    backendSpy = jasmine.createSpyObj('BackendService', ['getDropdownOption'])
    backendSpy.getDropdownOption.and.returnValue(of([]))

    TestBed.configureTestingModule({
      imports: [
        StatisticsPageComponent,
        SensorGroupSelectorComponent,
        DateTimePickerComponent,
        AnomalyListComponent,
        ScatterChartComponent,
        ReactiveFormsModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: StatsService, useValue: statsSpy },
        { provide: WebStorageService, useValue: storageSpy },
        { provide: BackendService, useValue: backendSpy },
      ],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(StatisticsPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges() // triggers ngOnInit + loadFromStorage
  })

  it('should render two SensorGroupSelector and the DateTimePicker, but no results initially', () => {
    const selectors = fixture.debugElement.queryAll(By.directive(SensorGroupSelectorComponent))
    expect(selectors.length).toBe(2)

    expect(fixture.debugElement.query(By.directive(DateTimePickerComponent))).toBeTruthy()

    expect(component.resultsAvailable).toBeFalse()
    expect(fixture.nativeElement.querySelector('.comparison-card')).toBeNull()

    const scatterCharts = fixture.debugElement.queryAll(By.directive(ScatterChartComponent))
    expect(scatterCharts.length).toBe(0)

    const anomalyLists = fixture.debugElement.queryAll(By.directive(AnomalyListComponent))
    expect(anomalyLists.length).toBe(0)
  })

  it('should set error if Compute clicked without selecting both groups', fakeAsync(() => {
    const computeBtn: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]')!
    computeBtn.click()
    tick()
    fixture.detectChanges()

    expect(component.errorMessage).toBe('Bitte beide Gruppen auswählen.')

    const matError = fixture.nativeElement.querySelector('mat-error')
    expect(matError.textContent).toContain('Bitte beide Gruppen auswählen.')
  }))

  it('should call StatsService and display comparison table and charts on valid Compute', fakeAsync(() => {
    // 1) Fill both group controls
    const fakeGroup: SensorGroup = {
      sensors: [{ measurementName: 'm1', sensorName: 's1', alias: 'alias1' }],
    }
    component.group1Ctrl.setValue(fakeGroup)
    component.group2Ctrl.setValue(fakeGroup)

    // 2) Provide a valid date-time range
    const testDate = new Date('2025-06-01T00:00:00Z')
    component.timeForm.get('dateTimeRange')?.setValue({
      fromDate: testDate,
      fromTime: '00:00',
      toDate: testDate,
      toTime: '01:00',
    })
    fixture.detectChanges()

    const computeBtn: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]')!
    computeBtn.click()
    tick()
    fixture.detectChanges()

    // 4) verify service calls
    expect(statsSpy.computeStats).toHaveBeenCalledTimes(2)
    expect(statsSpy.computeCorrelation).toHaveBeenCalledTimes(1)

    // 5) comparison-card appears
    expect(component.resultsAvailable).toBeTrue()
    const comparisonCard = fixture.nativeElement.querySelector('.comparison-card')
    expect(comparisonCard).toBeTruthy()

    // 6) check “Anzahl Datenpunkte” row
    const rows = fixture.nativeElement.querySelectorAll('.comparison-table .table-row')
    const countRow = Array.from(rows).find((row) =>
      (row as HTMLElement)
        .querySelector('.label-column')
        ?.textContent?.includes('Anzahl Datenpunkte')
    ) as HTMLElement
    expect(countRow).toBeTruthy()
    const group1CountCell = countRow.querySelectorAll('div')[1] as HTMLElement
    expect(group1CountCell.textContent?.trim()).toBe('2')

    // 7) two scatter charts
    const scatterCharts = fixture.debugElement.queryAll(By.directive(ScatterChartComponent))
    expect(scatterCharts.length).toBe(2)

    // 8) “Anomalien anzeigen” button should be enabled
    expect(component.canShowAnomalies).toBeTrue()
    const anomalyBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.anomaly-button')!
    expect(anomalyBtn.disabled).toBeFalse()
    expect(anomalyBtn.textContent).toContain('Anomalien anzeigen')
  }))

  it('should apply Quick-Range, call StatsService with quickRange, and render results', fakeAsync(() => {
    // 1) Fill group controls
    const fakeGroup: SensorGroup = {
      sensors: [{ measurementName: 'm1', sensorName: 's1', alias: 'alias1' }],
    }
    component.group1Ctrl.setValue(fakeGroup)
    component.group2Ctrl.setValue(fakeGroup)
    fixture.detectChanges()

    // 3) Click first Quick-Range button (“Letzte Woche”)
    const quickButtons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('button.quick-select-btn')
    expect(quickButtons.length).toBe(3)
    quickButtons[0].click()
    tick()
    fixture.detectChanges()

    // 5) results show up
    expect(component.resultsAvailable).toBeTrue()
    const scatterCharts = fixture.debugElement.queryAll(By.directive(ScatterChartComponent))
    expect(scatterCharts.length).toBe(2)
  }))

  it('should display anomalies list after clicking “Anomalien anzeigen”', fakeAsync(() => {
    // 1) Compute valid results first
    const fakeGroup: SensorGroup = {
      sensors: [{ measurementName: 'm1', sensorName: 's1', alias: 'alias1' }],
    }
    component.group1Ctrl.setValue(fakeGroup)
    component.group2Ctrl.setValue(fakeGroup)
    const testDate = new Date('2025-06-01T00:00:00Z')
    component.timeForm.get('dateTimeRange')?.setValue({
      fromDate: testDate,
      fromTime: '00:00',
      toDate: testDate,
      toTime: '01:00',
    })
    fixture.detectChanges()

    component.onCompute()
    tick()
    fixture.detectChanges()

    // 2) Click “Anomalien anzeigen”
    const anomalyBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.anomaly-button')!
    anomalyBtn.click()
    tick()
    fixture.detectChanges()

    // 3) anomalyChecked true & two anomaly lists
    expect(component.anomalyChecked).toBeTrue()
    const lists = fixture.debugElement.queryAll(By.directive(AnomalyListComponent))
    expect(lists.length).toBe(2)

    // 4) “no outlier” template should NOT appear
    const noAnomalyText = fixture.nativeElement.querySelector('p > strong')
    expect(noAnomalyText).toBeNull()
  }))

  it('should show “no outliers found” message when detectOutliers returns empty', fakeAsync(() => {
    // 1) Compute valid results
    const fakeGroup: SensorGroup = {
      sensors: [{ measurementName: 'm1', sensorName: 's1', alias: 'alias1' }],
    }
    component.group1Ctrl.setValue(fakeGroup)
    component.group2Ctrl.setValue(fakeGroup)
    const testDate = new Date('2025-06-01T00:00:00Z')
    component.timeForm.get('dateTimeRange')?.setValue({
      fromDate: testDate,
      fromTime: '00:00',
      toDate: testDate,
      toTime: '01:00',
    })
    fixture.detectChanges()

    component.onCompute()
    tick()
    fixture.detectChanges()

    // 2) Override detectOutliers to return an empty array
    statsSpy.detectOutliers.and.returnValue(of([]))

    // 3) Click “Anomalien anzeigen”
    const anomalyBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.anomaly-button')!
    anomalyBtn.click()
    tick()
    fixture.detectChanges()

    // 4) “Keine Ausreißer...” message appears
    const noAnom = fixture.nativeElement.querySelector('p > strong')
    expect(noAnom).toBeTruthy()
    expect(noAnom.textContent).toContain('Keine Ausreißer')

    const lists = fixture.debugElement.queryAll(By.directive(AnomalyListComponent))
    expect(lists.length).toBe(0)
  }))

  it('should load saved stats & correlation from WebStorage on init', () => {
    const storedPayload = JSON.stringify({
      s1: dummyResult,
      s2: dummyResult,
      corr: dummyCorr,
    })
    storageSpy.get.and.returnValue(storedPayload)

    // Recreate component to trigger loadFromStorage()
    fixture.destroy()
    fixture = TestBed.createComponent(StatisticsPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

    expect(component.resultsGroup1).toEqual(dummyResult)
    expect(component.resultsGroup2).toEqual(dummyResult)
    expect(component.correlation).toBe(dummyCorr)

    // Because results are loaded, comparison-card should be visible
    expect(component.resultsAvailable).toBeTrue()
    expect(fixture.nativeElement.querySelector('.comparison-card')).toBeTruthy()
  })
})
