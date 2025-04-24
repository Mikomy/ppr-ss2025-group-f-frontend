import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HomePageComponent } from './home-page.component'
import { BackendService } from '../../services/backend.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'

describe('HomePageComponent', () => {
  let component: HomePageComponent
  let fixture: ComponentFixture<HomePageComponent>

  beforeEach(async () => {
    // Create a spy for BackendService
    const spy = jasmine.createSpyObj('BackendService', ['getStatistics'])

    await TestBed.configureTestingModule({
      imports: [
        HomePageComponent, // standalone component imports its Angular Material & CommonModule dependencies
        HttpClientTestingModule, // provide HttpClient for BackendService
      ],
      providers: [{ provide: BackendService, useValue: spy }],
    }).compileComponents()

    fixture = TestBed.createComponent(HomePageComponent)
    component = fixture.componentInstance
    backendServiceSpy = TestBed.inject(BackendService) as jasmine.SpyObj<BackendService>
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should set statistics and reset error in loadStatistics', () => {
    component.statisticsError = 'previous error'
    component.loadStatistics()

    expect(component.statistics).toBeDefined()
    expect(component.statisticsError).toBeNull()
    expect(component.statistics?.averageTemperature).toBe(21.5)
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
