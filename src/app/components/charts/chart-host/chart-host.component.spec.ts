import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts'
import { ChartHostComponent } from './chart-host.component'
import { ChartType } from '../chart-config-row/chart-config-row.component'

// Dummy data series for testing
const dummySeries = [
  { label: 'A', data: [{ timestamp: '2025-04-01T00:00:00Z', value: 1 }], color: '#000' },
]

describe('ChartHostComponent', () => {
  let component: ChartHostComponent
  let fixture: ComponentFixture<ChartHostComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartHostComponent],
      providers: [{ provide: NGX_ECHARTS_CONFIG, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(ChartHostComponent)
    component = fixture.componentInstance
    component.dataSeries = dummySeries
  })

  it('should create', () => {
    fixture.detectChanges()
    expect(component).toBeTruthy()
  })

  it('should render line chart by default', () => {
    // default chartType is 'line'
    fixture.detectChanges()
    const line = fixture.nativeElement.querySelector('app-line-chart')
    const bar = fixture.nativeElement.querySelector('app-bar-chart')
    const heat = fixture.nativeElement.querySelector('app-heatmap-chart')

    expect(line).toBeTruthy()
    expect(bar).toBeNull()
    expect(heat).toBeNull()
  })

  it('should render bar chart when chartType is bar', () => {
    component.chartType = 'bar' as ChartType
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('app-bar-chart')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('app-line-chart')).toBeNull()
    expect(fixture.nativeElement.querySelector('app-heatmap-chart')).toBeNull()
  })

  it('should render heatmap chart when chartType is heatmap', () => {
    component.chartType = 'heatmap' as ChartType
    fixture.detectChanges()
    expect(fixture.nativeElement.querySelector('app-heatmap-chart')).toBeTruthy()
    expect(fixture.nativeElement.querySelector('app-line-chart')).toBeNull()
    expect(fixture.nativeElement.querySelector('app-bar-chart')).toBeNull()
  })
})
