import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing'
import { HomePageComponent } from './home-page.component'
import { BackendService } from '../../services/backend.service'
import { of } from 'rxjs'
import { SensorData } from '../../models/sensorData.model'
import { Measurement } from '../../models/measurement.model'

describe('HomePageComponent', () => {
  let component: HomePageComponent
  let fixture: ComponentFixture<HomePageComponent>
  let backendServiceSpy: jasmine.SpyObj<BackendService>

  // Prepare sample data for testing:
  const measurementSoil: Measurement = {
    measurementName: 'Soil Moisture',
    sensor: {
      name: 'Senzemo_Senstick_Bodenfeuchtesensor_1',
      id: '00137a1000045594',
      location: 'Beet 1', // Updated so that it is considered valid.
    },
    dataPoints: [
      { timestamp: '2025-03-29T23:20:00Z', value: 29 },
      { timestamp: '2025-03-29T23:00:00Z', value: 29 },
      { timestamp: '2025-03-29T22:40:00Z', value: 28 },
    ],
  }

  const measurementPhosphor: Measurement = {
    measurementName: 'Phosphorus',
    sensor: {
      name: 'Senzemo_Senstick_Phosphor_1',
      id: '00137a1000045593',
      location: 'Beet 1',
    },
    dataPoints: [
      { timestamp: '2025-03-29T23:20:00Z', value: 1 },
      { timestamp: '2025-03-29T23:00:00Z', value: 1 },
      { timestamp: '2025-03-29T22:40:00Z', value: 1 },
    ],
  }

  const measurementNitrogen: Measurement = {
    measurementName: 'Nitrogen',
    sensor: {
      name: 'Senzemo_Senstick_Stickstoff_1',
      id: '00137a1000045592',
      location: 'Beet 1',
    },
    dataPoints: [
      { timestamp: '2025-03-29T23:20:00Z', value: 1 },
      { timestamp: '2025-03-29T23:00:00Z', value: 1 },
      { timestamp: '2025-03-29T22:40:00Z', value: 1 },
    ],
  }

  const measurementHumidity: Measurement = {
    measurementName: 'Humidity',
    sensor: {
      name: 'Senzemo_Senstick_Luftfeuchtesensor_1',
      id: '00137a1000045591',
      location: 'Beet 1',
    },
    dataPoints: [
      { timestamp: '2025-03-29T23:20:00Z', value: 50 },
      { timestamp: '2025-03-29T23:00:00Z', value: 55 },
      { timestamp: '2025-03-29T22:40:00Z', value: 53 },
    ],
  }

  const measurementRoomTemp: Measurement = {
    measurementName: 'Room Temperature',
    sensor: {
      name: 'Senzemo_Senstick_Raumtemperatursensor_1',
      id: '00137a1000045590',
      location: 'Beet 1',
    },
    dataPoints: [
      { timestamp: '2025-03-29T23:20:00Z', value: 22 },
      { timestamp: '2025-03-29T23:00:00Z', value: 21 },
      { timestamp: '2025-03-29T22:40:00Z', value: 20 },
    ],
  }

  beforeEach(waitForAsync(() => {
    // Override setTimeout so that callbacks execute immediately.
    spyOn(window, 'setTimeout').and.callFake(
      (handler: TimerHandler, timeout?: number, ...args: unknown[]): number => {
        if (typeof handler === 'function') {
          handler(...(args as []))
        } else {
          eval(handler)
        }
        return 0
      }
    )

    // Create a spy object for the BackendService.
    backendServiceSpy = jasmine.createSpyObj('BackendService', [
      'getSoilMoistrue',
      'getPhosphorData',
      'getNitrogenData',
      'getHumidityData',
      'getRoomTemperatureData',
    ])

    // Set up the backendService spy methods with our sample data.
    backendServiceSpy.getSoilMoistrue.and.returnValue(of(measurementSoil))
    backendServiceSpy.getPhosphorData.and.returnValue(of(measurementPhosphor))
    backendServiceSpy.getNitrogenData.and.returnValue(of(measurementNitrogen))
    backendServiceSpy.getHumidityData.and.returnValue(of(measurementHumidity))
    backendServiceSpy.getRoomTemperatureData.and.returnValue(of(measurementRoomTemp))

    TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [{ provide: BackendService, useValue: backendServiceSpy }],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePageComponent)
    component = fixture.componentInstance
    fixture.detectChanges() // This triggers ngOnInit, which calls loadMeasurements.
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should group measurements by location after backend calls', fakeAsync(() => {
    // Advance the virtual timer to execute any asynchronous operations.
    tick(1000)

    // We expect that all five measurements share the same location ("Beet 1")
    // So the measurementsByLocation should have 1 key with 5 elements.
    expect(Object.keys(component.measurementsByLocation).length).toBe(1)
    expect(component.measurementsByLocation['Beet 1'].length).toBe(5)
  }))

  it('should correctly select the latest sensor data', () => {
    // Testing the getLatestData method with sample data points.
    const dataPoints: SensorData[] = [
      { timestamp: '2025-04-09T12:00:00Z', value: 10 },
      { timestamp: '2025-04-09T12:05:00Z', value: 20 },
      { timestamp: '2025-04-09T12:03:00Z', value: 15 },
    ]
    const latestData = component['getLatestData'](dataPoints)
    expect(latestData).toEqual({ timestamp: '2025-04-09T12:05:00Z', value: 20 })
  })

  it('should not add measurement if measurement data is invalid', () => {
    // Testing addMeasurement with invalid measurement data.
    const invalidMeasurement: Measurement = {
      measurementName: 'Invalid Measurement',
      sensor: { name: '', id: '', location: '' },
      dataPoints: [],
    }
    const initialGroupCount = Object.keys(component.measurementsByLocation).length
    component['addMeasurement'](invalidMeasurement)
    expect(Object.keys(component.measurementsByLocation).length).toBe(initialGroupCount)
  })

  describe('Unit: loadStatistics', () => {
    it('should set statistics with random values', () => {
      component.loadStatistics()
      expect(component.statistics).toBeDefined()
      expect(typeof component.statistics!.averageTemperature).toBe('number')
      expect(typeof component.statistics!.averageHumidity).toBe('number')
      expect(component.statistics!.oldestMeasurement.dataPoints.length).toBeGreaterThan(0)
      expect(component.statistics!.newestMeasurement.dataPoints.length).toBeGreaterThan(0)
    })

    it('should set statisticsError and reset statistics on error', () => {
      // Fehler im Code provozieren, indem Math.random einen Fehler wirft
      const originalRandom = Math.random
      Math.random = () => {
        throw new Error('Testfehler')
      }
      component.loadStatistics()
      Math.random = originalRandom
      expect(component.statistics).toBeUndefined()
      expect(component.statisticsError).toContain('Fehler beim Laden der Statistiken')
    })
  })

  describe('Integration: ngOnInit', () => {
    it('should call loadStatistics and set statistics', () => {
      spyOn(component, 'loadStatistics').and.callThrough()
      component.ngOnInit()
      expect(component.loadStatistics).toHaveBeenCalled()
      expect(component.statistics).toBeDefined()
    })
  })

  describe('Template: Fehleranzeige', () => {
    it('should show dashboard_error when statistics is undefined', () => {
      // Fehler provozieren, damit statistics undefined ist
      const originalRandom = Math.random
      Math.random = () => {
        throw new Error('Testfehler')
      }
      component.loadStatistics()
      Math.random = originalRandom
      fixture.detectChanges()

      const compiled = fixture.nativeElement as HTMLElement
      const errorDiv = compiled.querySelector('.dashboard_error')
      expect(errorDiv).toBeTruthy()
      expect(errorDiv?.textContent).toContain('Keine Daten verfügbar')
    })
  })
})
