import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { of, throwError } from 'rxjs'

import { HistorischeAnalysePageComponent } from './historische-analyse-page.component'
import { BackendService } from '../../services/backend.service'
import { WebStorageService } from '../../services/webStorage.service'
import { ChartConfig } from '../../components/charts/chart-config-row/chart-config-row.component'
import { Measurement } from '../../models/measurement.model'
import { SavedChart } from '../../models/savedChart.model'

// Helper to create a valid ChartConfig with measurement
function createConfig(measurementName: string, sensorName: string): ChartConfig {
  return {
    measurement: {
      measurementName,
      sensor: { id: '1', name: sensorName, location: 'Loc' },
      alias: 'c',
    },
    color: '#123456',
    chartType: 'line',
  }
}

// Sample measurement data
const sampleMeasurement: Measurement = {
  measurementName: 'Test',
  sensor: { id: '1', name: 'Sensor A', location: 'Loc' },
  dataPoints: [{ timestamp: '2025-04-01T00:00:00Z', value: 100 }],
}

describe('HistorischeAnalysePageComponent', () => {
  let component: HistorischeAnalysePageComponent
  let fixture: ComponentFixture<HistorischeAnalysePageComponent>
  let backendSpy: jasmine.SpyObj<BackendService>
  let storageSpy: jasmine.SpyObj<WebStorageService>

  beforeEach(async () => {
    backendSpy = jasmine.createSpyObj('BackendService', ['getMeasurement', 'getDropdownOption'])
    backendSpy.getDropdownOption.and.returnValue(of([]))
    storageSpy = jasmine.createSpyObj('WebStorageService', ['get', 'set'])
    storageSpy.get.and.returnValue(null)

    await TestBed.configureTestingModule({
      imports: [HistorischeAnalysePageComponent, ReactiveFormsModule],
      providers: [
        { provide: BackendService, useValue: backendSpy },
        { provide: WebStorageService, useValue: storageSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(HistorischeAnalysePageComponent)
    component = fixture.componentInstance
    fixture.detectChanges() // ngOnInit
  })

  it('should create and initialize form and savedCharts', () => {
    expect(component).toBeTruthy()
    expect(component.timeForm).toBeDefined()
    expect(component.savedCharts).toEqual([])
  })

  it('onConfigChange should update config and clear errorMessage', () => {
    const newCfg = createConfig('M1', 'Sensor A')
    component.errorMessage = 'Some error'
    component.onConfigChange(1, newCfg)
    expect(component.configs[1]).toEqual(newCfg)
    expect(component.errorMessage).toBeUndefined()
  })

  it('loadCharts should error when no measurement selected', () => {
    // default configs have no measurement
    component.loadCharts()
    expect(component.errorMessage).toBe('Bitte mindestens eine Messung auswählen.')
  })

  it('loadCharts should error when timeForm invalid', () => {
    // set one valid measurement
    component.configs[0] = createConfig('M1', 'Sensor A')
    component.loadCharts()
    expect(component.timeError).toBe('Bitte komplettes Zeitintervall auswählen.')
  })

  describe('data fetching scenarios', () => {
    beforeEach(() => {
      component.configs[0] = createConfig('Test', 'Sensor A')
      component.timeForm.setValue({
        fromDate: new Date('2025-04-01'),
        fromTime: '00:00',
        toDate: new Date('2025-04-01'),
        toTime: '01:00',
      })
    })

    it('should set errorMessage when backend throws', fakeAsync(() => {
      backendSpy.getMeasurement.and.returnValue(throwError(() => new Error('fail')))
      component.loadCharts()
      tick()
      expect(component.errorMessage).toBe('Fehler beim Laden der Charts.')
    }))

    it('should error when filterBySensor returns undefined', fakeAsync(() => {
      backendSpy.getMeasurement.and.returnValue(of([]))
      component.loadCharts()
      tick()
      expect(component.errorMessage).toBe(
        'Nicht für jede Messung Daten für den gewählten Sensor gefunden.'
      )
    }))

    it('should error when dataPoints empty', fakeAsync(() => {
      const emptyMeas: Measurement = { ...sampleMeasurement, dataPoints: [] }
      backendSpy.getMeasurement.and.returnValue(of([emptyMeas]))
      component.loadCharts()
      tick()
      expect(component.errorMessage).toBe(
        'Mindestens eine Messung enthält keine Datenpunkte im Zeitraum.'
      )
    }))

    it('should save chart on success and call storage.set', fakeAsync(() => {
      backendSpy.getMeasurement.and.returnValue(of([sampleMeasurement]))
      component.loadCharts()
      tick()
      expect(component.savedCharts.length).toBe(1)
      const saved: SavedChart = component.savedCharts[0]
      expect(saved.titles).toEqual(['Test'])
      expect(saved.series[0].data[0].value).toBe(100)
      expect(storageSpy.set).toHaveBeenCalledWith(
        'saved-sensor-charts',
        JSON.stringify(component.savedCharts)
      )
    }))
  })

  it('removeChart should remove entry and persist', () => {
    const chart1: SavedChart = {
      id: '1',
      titles: ['A'],
      from: '',
      to: '',
      series: [],
      chartType: 'line',
    }
    const chart2: SavedChart = {
      id: '2',
      titles: ['B'],
      from: '',
      to: '',
      series: [],
      chartType: 'line',
    }
    component.savedCharts = [chart1, chart2]
    component.removeChart('1')
    expect(component.savedCharts).toEqual([chart2])
    expect(storageSpy.set).toHaveBeenCalledWith('saved-sensor-charts', JSON.stringify([chart2]))
  })
})
