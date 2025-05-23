import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of, Subject } from 'rxjs'
import { HomePageComponent } from './home-page.component'
import { BackendService } from '../../services/backend.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router'

interface QueryParams {
  sensorName?: string
  measurementName?: string
}

describe('HomePageComponent', () => {
  let component: HomePageComponent
  let fixture: ComponentFixture<HomePageComponent>
  let backendServiceSpy: jasmine.SpyObj<BackendService>
  let routerSpy: jasmine.SpyObj<Router>
  const queryParamsSubject = new Subject<QueryParams>()

  beforeEach(async () => {
    // Create spies
    backendServiceSpy = jasmine.createSpyObj('BackendService', [
      'getDashboardStatistics',
      'getOpenAiSynopsis',
      'getDropdownOption',
      'getFilteredDashboardStatistics',
    ])
    routerSpy = jasmine.createSpyObj('Router', ['navigate'])

    // Setup mock responses
    backendServiceSpy.getDashboardStatistics.and.returnValue(
      of({
        overallTotalPointCount: 0,
        averageValues: {},
        latestMeasurements: {},
        measurementPointCount: {},
        minValues: {},
        maxValues: {},
      })
    )
    backendServiceSpy.getOpenAiSynopsis.and.returnValue(of('Test Synopsis'))
    backendServiceSpy.getDropdownOption.and.returnValue(of([]))

    await TestBed.configureTestingModule({
      imports: [HomePageComponent, HttpClientTestingModule],
      providers: [
        { provide: BackendService, useValue: backendServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable(),
            snapshot: {
              queryParamMap: convertToParamMap({}),
            },
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(HomePageComponent)
    component = fixture.componentInstance

    // Emit initial empty query params
    queryParamsSubject.next({})

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
