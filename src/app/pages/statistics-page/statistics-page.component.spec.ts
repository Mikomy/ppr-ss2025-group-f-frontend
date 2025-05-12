import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { StatisticsPageComponent } from './statistics-page.component'
import { StatsService } from '../../components/statistics/stats.service'
import { StatisticResult } from '../../models/stats.model'

describe('StatisticsPageComponent (shallow)', () => {
  let component: StatisticsPageComponent
  let fixture: ComponentFixture<StatisticsPageComponent>
  let statsSpy: jasmine.SpyObj<StatsService>

  const dummyResult: StatisticResult = {
    count: 1,
    mean: 10,
    median: 10,
    min: 10,
    max: 10,
    variance: 0,
    stdDev: 0,
    p25: 10,
    p75: 10,
    iqr: 0,
    trend: 0,
    series: [],
  }

  beforeEach(async () => {
    statsSpy = jasmine.createSpyObj('StatsService', ['computeStats', 'computeCorrelation'])
    statsSpy.computeStats.and.returnValue(of(dummyResult))
    statsSpy.computeCorrelation.and.returnValue(of(0.5))

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [{ provide: StatsService, useValue: statsSpy }, provideHttpClientTesting()],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(StatisticsPageComponent, {
        set: { template: '' },
      })
      .compileComponents()

    fixture = TestBed.createComponent(StatisticsPageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create and initialize form', () => {
    expect(component).toBeTruthy()
    const form = component.form
    expect(form).toBeDefined()
    ;['fromDate', 'fromTime', 'toDate', 'toTime', 'group1', 'group2'].forEach((control) => {
      expect(form.contains(control)).toBeTrue()
    })
  })

  it('should set errorMessage if groups are empty on compute', () => {
    const testDate = new Date('2025-05-01T00:00:00Z')
    component.group1Ctrl.setValue({
      sensors: [{ measurementName: 'm', sensorName: 's', alias: 'c' }],
    })
    component.fromDateCtrl.setValue(testDate)
    component.fromTimeCtrl.setValue('00:00')
    component.toDateCtrl.setValue(testDate)
    component.toTimeCtrl.setValue('01:00')
    component.onCompute()
    expect(component.errorMessage).toBe('Bitte mindestens einen Measurement pro Gruppe auswählen.')
  })

  it('should call StatsService and set results on valid form', fakeAsync(() => {
    const now = new Date('2025-05-01T00:00:00Z')
    component.group1Ctrl.setValue({
      sensors: [{ measurementName: 'm', sensorName: 's', alias: 'c' }],
    })
    component.group2Ctrl.setValue({
      sensors: [{ measurementName: 'm', sensorName: 's', alias: 'c' }],
    })
    component.fromDateCtrl.setValue(now)
    component.fromTimeCtrl.setValue('00:00')
    component.toDateCtrl.setValue(now)
    component.toTimeCtrl.setValue('01:00')

    component.onCompute()
    tick()
    expect(statsSpy.computeStats).toHaveBeenCalledTimes(2)
    expect(statsSpy.computeCorrelation).toHaveBeenCalled()
    expect(component.resultsGroup1).toEqual(dummyResult)
    expect(component.resultsGroup2).toEqual(dummyResult)
    expect(component.correlation).toBe(0.5)
    expect(component.errorMessage).toBeUndefined()
  }))

  it('should set errorMessage if StatsService errors', fakeAsync(() => {
    statsSpy.computeStats.and.returnValue(throwError(() => new Error('fail')))
    component.group1Ctrl.setValue({
      sensors: [{ measurementName: 'm', sensorName: 's', alias: 'c' }],
    })
    component.group2Ctrl.setValue({
      sensors: [{ measurementName: 'm', sensorName: 's', alias: 'c' }],
    })
    const now = new Date('2025-05-01T00:00:00Z')
    component.fromDateCtrl.setValue(now)
    component.fromTimeCtrl.setValue('00:00')
    component.toDateCtrl.setValue(now)
    component.toTimeCtrl.setValue('01:00')

    component.onCompute()
    tick()
    expect(component.errorMessage).toBe('Fehler beim Abrufen der Statistik-Daten.')
  }))

  it('should set errorMessage if no data in results', fakeAsync(() => {
    statsSpy.computeStats.and.returnValue(of({ ...dummyResult, count: 0 }))
    component.group1Ctrl.setValue({
      sensors: [{ measurementName: 'm', sensorName: 's', alias: 'c' }],
    })
    component.group2Ctrl.setValue({
      sensors: [{ measurementName: 'm', sensorName: 's', alias: 'c' }],
    })
    const now = new Date('2025-05-01T00:00:00Z')
    component.fromDateCtrl.setValue(now)
    component.fromTimeCtrl.setValue('00:00')
    component.toDateCtrl.setValue(now)
    component.toTimeCtrl.setValue('01:00')

    component.onCompute()
    tick()
    expect(component.errorMessage).toBe(
      'Für mindestens eine Gruppe wurden keine Daten im gewählten Zeitraum gefunden.'
    )
  }))

  it('dateRangeValidator should flag invalid range', () => {
    const from = new Date('2025-05-02T00:00:00Z')
    const to = new Date('2025-05-01T00:00:00Z')
    component.fromDateCtrl.setValue(from)
    component.fromTimeCtrl.setValue('10:00')
    component.toDateCtrl.setValue(to)
    component.toTimeCtrl.setValue('09:00')
    component.form.updateValueAndValidity()
    expect(component.form.hasError('dateRangeInvalid')).toBeTrue()
  })
})
