import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { StatisticsDisplayComponent } from './statistics-display.component'
import { StatisticResult, Series } from '../../../models/stats.model'
import { ScatterChartComponent } from '../../charts/scatter-chart/scatter-chart.component'

describe('StatisticsDisplayComponent', () => {
  let component: StatisticsDisplayComponent
  let fixture: ComponentFixture<StatisticsDisplayComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsDisplayComponent, ScatterChartComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(StatisticsDisplayComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should display "Keine Daten verfügbar." when stats is undefined', () => {
    component.stats = undefined
    fixture.detectChanges()

    const noDataEl = fixture.nativeElement.querySelector('p')
    expect(noDataEl).toBeTruthy()
    expect(noDataEl.textContent.trim()).toBe('Keine Daten verfügbar.')

    // Should not render mat-list
    const listEl = fixture.nativeElement.querySelector('mat-list')
    expect(listEl).toBeNull()
  })

  it('should render statistic values when stats is provided', () => {
    const mockSeries: Series[] = [
      { measurementName: 'A', sensorName: 'A', points: [] },
      { measurementName: 'B', sensorName: 'B', points: [] },
    ]
    const mockStats: StatisticResult = {
      count: 5,
      mean: 10.123,
      median: 9.5,
      p25: 8,
      p75: 12,
      iqr: 4,
      min: 5,
      max: 15,
      variance: 20,
      stdDev: Math.sqrt(20),
      trend: -0.5,
      series: mockSeries,
    }

    component.stats = mockStats
    fixture.detectChanges()

    const items = fixture.nativeElement.querySelectorAll('mat-list-item')
    const texts = [...items].map((el: Element) => el.textContent?.trim() ?? '')

    expect(texts).toContain('Anzahl der Messwerte: 5')
    expect(texts).toContain('Durchschnitt (Mittelwert): 10.12')
    expect(texts).toContain('Median: 9.50')
    expect(texts).toContain('25 %-Perzentil: 8.00')
    expect(texts).toContain('75 %-Perzentil: 12.00')
    expect(texts).toContain('Interquartilsabstand (IQR): 4.00')
    expect(texts).toContain('Minimum: 5.00')
    expect(texts).toContain('Maximum: 15.00')
    expect(texts).toContain('Varianz: 20.00')
    expect(texts).toContain(`Standardabweichung: ${mockStats.stdDev.toFixed(2)}`)
    expect(texts).toContain('Trend (Steigung): -0.50')
  })

  it('trackByName should return measurementName', () => {
    const series: Series = { measurementName: 'X', sensorName: 'Y', points: [] }
    const result = component.trackByName(0, series)
    expect(result).toBe('X')
  })
})
