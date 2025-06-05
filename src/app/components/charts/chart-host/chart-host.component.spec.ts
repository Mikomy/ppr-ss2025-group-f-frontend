// src/app/components/charts/chart-host/chart-host.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ChartHostComponent } from './chart-host.component'
import { ChartDataset } from 'chart.js'

describe('ChartHostComponent', () => {
  let component: ChartHostComponent
  let fixture: ComponentFixture<ChartHostComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartHostComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ChartHostComponent)
    component = fixture.componentInstance
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should have empty chartData.datasets when dataSeries is undefined', () => {
    component.dataSeries = undefined as {
      label: string
      data: { timestamp: string; value: number }[]
      color: string
      chartType: 'bar' | 'line'
    }[]
    fixture.detectChanges()
    expect(component.chartData.datasets).toEqual([])
  })

  it('should have empty chartData.datasets when dataSeries is an empty array', () => {
    component.dataSeries = []
    fixture.detectChanges()
    expect(component.chartData.datasets).toEqual([])
  })

  it('should transform a single line series correctly', () => {
    component.dataSeries = [
      {
        label: 'Test Line',
        data: [
          { timestamp: '2025-06-01T00:00:00Z', value: 10 },
          { timestamp: '2025-06-02T00:00:00Z', value: 20 },
        ],
        color: '#ff0000',
        chartType: 'line' as const,
      },
    ]
    component.ngOnChanges()

    type LineDataset = ChartDataset<'line', { x: string; y: number }[]> & {
      tension: number
      fill: boolean
      pointRadius: number
    }
    // Expect exactly one dataset
    expect(component.chartData.datasets.length).toBe(1)
    const dataset = component.chartData.datasets[0] as LineDataset

    // Verify label and type
    expect(dataset.label).toBe('Test Line')
    expect(dataset.type).toBe('line')

    // Verify data points were transformed correctly
    expect(dataset.data).toEqual([
      { x: '2025-06-01T00:00:00Z', y: 10 },
      { x: '2025-06-02T00:00:00Z', y: 20 },
    ])

    // Verify line‐specific properties exist
    expect(dataset.tension).toBeCloseTo(0.1)
    expect(dataset.fill).toBeFalse()
    expect(dataset.pointRadius).toBe(2)
  })
})
