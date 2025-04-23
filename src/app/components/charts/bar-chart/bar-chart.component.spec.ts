import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SimpleChanges, SimpleChange } from '@angular/core'

import { BarChartComponent } from './bar-chart.component'

describe('BarChartComponent', () => {
  let component: BarChartComponent
  let fixture: ComponentFixture<BarChartComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarChartComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(BarChartComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should have default chartType set to "bar"', () => {
    expect(component.chartType).toBe('bar')
  })

  it('should initialize chartData with empty labels and datasets', () => {
    expect(component.chartData.labels).toEqual([])
    expect(component.chartData.datasets).toEqual([])
  })

  describe('updateChart via ngOnChanges', () => {
    it('should update chartData for a single series', () => {
      const sampleSeries = [
        {
          label: 'Series 1',
          data: [
            { timestamp: '2025-04-22T08:00:00Z', value: 100 },
            { timestamp: '2025-04-22T09:00:00Z', value: 200 },
          ],
          color: '#abcdef',
        },
      ]

      component.dataSeries = sampleSeries
      const changes: SimpleChanges = {
        dataSeries: new SimpleChange([], sampleSeries, true),
      }
      component.ngOnChanges(changes)

      // Labels should come from timestamps of the first (and only) series
      expect(component.chartData.labels).toEqual(['2025-04-22T08:00:00Z', '2025-04-22T09:00:00Z'])

      // One dataset with matching values and styling
      expect(component.chartData.datasets.length).toBe(1)
      const dataset = component.chartData.datasets[0]
      expect(dataset.label).toBe('Series 1')
      expect(dataset.data).toEqual([100, 200])
      expect(dataset.backgroundColor).toBe('#abcdef')
      expect(dataset.borderColor).toBe('#abcdef')
      expect(dataset.borderWidth).toBe(1)
    })

    it('should handle multiple dataSeries correctly', () => {
      const seriesA = {
        label: 'A',
        data: [
          { timestamp: '2025-04-21T07:00:00Z', value: 10 },
          { timestamp: '2025-04-21T08:00:00Z', value: 20 },
        ],
        color: '#111111',
      }
      const seriesB = {
        label: 'B',
        data: [
          { timestamp: '2025-04-21T07:00:00Z', value: 30 },
          { timestamp: '2025-04-21T08:00:00Z', value: 40 },
        ],
        color: '#222222',
      }
      const input = [seriesA, seriesB]

      component.dataSeries = input
      const changes: SimpleChanges = {
        dataSeries: new SimpleChange([], input, true),
      }
      component.ngOnChanges(changes)

      // Labels from first series only
      expect(component.chartData.labels).toEqual(['2025-04-21T07:00:00Z', '2025-04-21T08:00:00Z'])

      // Two datasets created
      expect(component.chartData.datasets.length).toBe(2)
      const [first, second] = component.chartData.datasets

      // Verify first dataset
      expect(first.label).toBe('A')
      expect(first.data).toEqual([10, 20])
      expect(first.backgroundColor).toBe('#111111')
      expect(first.borderColor).toBe('#111111')

      // Verify second dataset
      expect(second.label).toBe('B')
      expect(second.data).toEqual([30, 40])
      expect(second.backgroundColor).toBe('#222222')
      expect(second.borderColor).toBe('#222222')
    })

    it('should not change chartData if dataSeries is unchanged', () => {
      const initial = {
        labels: ['x'],
        datasets: [
          { label: 'X', data: [1], backgroundColor: '#000', borderColor: '#000', borderWidth: 1 },
        ],
      }
      component.chartData = initial

      // Simulate other input change
      const changes: SimpleChanges = {}
      component.ngOnChanges(changes)

      expect(component.chartData).toBe(initial)
    })
  })
})
