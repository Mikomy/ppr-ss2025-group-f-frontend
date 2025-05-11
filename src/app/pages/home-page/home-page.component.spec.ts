import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'
import { HomePageComponent } from './home-page.component'
import { BackendService } from '../../services/backend.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'

describe('HomePageComponent', () => {
  let component: HomePageComponent
  let fixture: ComponentFixture<HomePageComponent>
  let backendServiceSpy: jasmine.SpyObj<BackendService>

  beforeEach(async () => {
    backendServiceSpy = jasmine.createSpyObj('BackendService', [
      'getDashboardStatistics',
      'getOpenAiSynopsis',
    ])
    // Mock Statistics with all required nested objects/fields for template
    backendServiceSpy.getDashboardStatistics.and.returnValue(
      of({
        overallTotalPointCount: 0,
        averageValues: {},
        latestMeasurements: {},
        measurementPointCount: {},
        minValues: {
          device_frmpayload_data_air_humidity_value: { timestamp: '', value: 0 },
          device_frmpayload_data_data_air_temperature_value: { timestamp: '', value: 0 },
          device_frmpayload_data_co2_concentration_value: { timestamp: '', value: 0 },
          device_frmpayload_data_data_SoilMoisture: { timestamp: '', value: 0 },
          device_frmpayload_data_nitrogen: { timestamp: '', value: 0 },
          device_frmpayload_data_phosphorus: { timestamp: '', value: 0 },
          device_frmpayload_data_potassium: { timestamp: '', value: 0 },
        },
        maxValues: {
          device_frmpayload_data_air_humidity_value: { timestamp: '', value: 0 },
          device_frmpayload_data_data_air_temperature_value: { timestamp: '', value: 0 },
          device_frmpayload_data_co2_concentration_value: { timestamp: '', value: 0 },
          device_frmpayload_data_data_SoilMoisture: { timestamp: '', value: 0 },
          device_frmpayload_data_nitrogen: { timestamp: '', value: 0 },
          device_frmpayload_data_phosphorus: { timestamp: '', value: 0 },
          device_frmpayload_data_potassium: { timestamp: '', value: 0 },
        },
      })
    )
    backendServiceSpy.getOpenAiSynopsis.and.returnValue(of('KI-Analyse'))

    await TestBed.configureTestingModule({
      imports: [
        HomePageComponent, // standalone component imports its Angular Material & CommonModule dependencies
        HttpClientTestingModule, // provide HttpClient for BackendService
      ],
      providers: [{ provide: BackendService, useValue: backendServiceSpy }],
    }).compileComponents()

    fixture = TestBed.createComponent(HomePageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should set statistics and reset error in loadStatistics', () => {
    component.statisticsError = 'previous error'
    component.loadStatistics()

    expect(component.statistics).toBeDefined()
    expect(component.statisticsError).toBeNull()
    // expect(component.statistics?.averageTemperature).toBe(21.5) // Entfernen oder anpassen, da averageTemperature nicht existiert
  })

  it('ngOnDestroy should clear the interval timer', () => {
    const clearSpy = spyOn(window, 'clearInterval')
    // Trigger ngOnInit to set an interval
    component.ngOnInit()
    // Destroy component to clear interval
    component.ngOnDestroy()
    expect(clearSpy).toHaveBeenCalled()
  })

  it('should display stats cards when statistics is defined', () => {
    component.loadStatistics()
    fixture.detectChanges()
    const compiled = fixture.nativeElement as HTMLElement
    const cards = compiled.querySelectorAll('.stat-card')
    expect(cards.length).toBeGreaterThan(0)
  })
})
