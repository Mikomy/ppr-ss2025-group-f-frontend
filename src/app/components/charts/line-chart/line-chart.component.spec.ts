import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SimpleChanges, SimpleChange } from '@angular/core'
import { LineChartComponent } from './line-chart.component'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)
describe('LineChartComponent', () => {
  let component: LineChartComponent
  let fixture: ComponentFixture<LineChartComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineChartComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(LineChartComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should have default chartType set to "line"', () => {
    expect(component.chartType).toBe('line')
  })

  it('should initialize chartData with empty labels and datasets', () => {
    expect(component.chartData.labels).toEqual([])
    expect(component.chartData.datasets).toEqual([])
  })

  it('should update chartData when dataSeries input is set', () => {
    const sampleSeries = [
      {
        label: 'Test Series',
        data: [
          { timestamp: '2025-04-21T10:00:00Z', value: 10 },
          { timestamp: '2025-04-21T11:00:00Z', value: 20 },
        ],
        color: '#ff0000',
      },
    ]

    // Simulate @Input change
    const changes: SimpleChanges = {
      dataSeries: new SimpleChange(undefined, sampleSeries, true),
    }
    component.dataSeries = sampleSeries
    component.ngOnChanges(changes)

    // Labels should come from timestamps of first series
    expect(component.chartData.labels).toEqual(['2025-04-21T10:00:00Z', '2025-04-21T11:00:00Z'])

    // Datasets should match values and styling
    expect(component.chartData.datasets.length).toBe(1)
    const dataset = component.chartData.datasets[0]
    expect(dataset.label).toBe('Test Series')
    expect(dataset.data).toEqual([10, 20])
    expect(dataset.fill).toBeFalse()
    expect(dataset.tension).toBe(0.1)
    expect(dataset.pointRadius).toBe(2)
  })

  it('should handle multiple dataSeries correctly', () => {
    const seriesA = {
      label: 'A',
      data: [
        { timestamp: '2025-04-20T09:00:00Z', value: 5 },
        { timestamp: '2025-04-20T10:00:00Z', value: 15 },
      ],
      color: '#00ff00',
    }
    const seriesB = {
      label: 'B',
      data: [
        { timestamp: '2025-04-20T09:00:00Z', value: 7 },
        { timestamp: '2025-04-20T10:00:00Z', value: 17 },
      ],
      color: '#0000ff',
    }
    const input = [seriesA, seriesB]

    const changes: SimpleChanges = {
      dataSeries: new SimpleChange(undefined, input, true),
    }
    component.dataSeries = input
    component.ngOnChanges(changes)

    // Labels taken from first series only
    expect(component.chartData.labels).toEqual(['2025-04-20T09:00:00Z', '2025-04-20T10:00:00Z'])

    // Two datasets created
    expect(component.chartData.datasets.length).toBe(2)

    // Verify second dataset
    const second = component.chartData.datasets[1]
    expect(second.label).toBe('B')
    expect(second.data).toEqual([7, 17])
  })
})
