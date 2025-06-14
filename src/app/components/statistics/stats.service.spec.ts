import { TestBed } from '@angular/core/testing'
import { of } from 'rxjs'
import { StatsService } from './stats.service'
import { BackendService } from '../../services/backend.service'
import { SensorGroup, Series, StatisticResult } from '../../models/stats.model'
import { Measurement } from '../../models/measurement.model'
import { ScatterDataPoint } from 'chart.js'

describe('StatsService', () => {
  let service: StatsService
  let backendSpy: jasmine.SpyObj<BackendService>

  beforeEach(() => {
    const spy = jasmine.createSpyObj('BackendService', ['getGroupedByAlias'])

    TestBed.configureTestingModule({
      providers: [StatsService, { provide: BackendService, useValue: spy }],
    })
    service = TestBed.inject(StatsService)
    backendSpy = TestBed.inject(BackendService) as jasmine.SpyObj<BackendService>
  })

  it('should compute correct statistics for single sensor', (done) => {
    const group: SensorGroup = {
      sensors: [{ measurementName: 'm1', sensorName: 's1', alias: 'c' }],
    }
    const now = new Date()
    const dataPoints = [
      { timestamp: now.toISOString(), value: 10 },
      { timestamp: now.toISOString(), value: 20 },
      { timestamp: now.toISOString(), value: 30 },
    ]
    const measurements: Measurement[] = [
      { measurementName: 'm1', sensor: { id: 's1', name: 's1', location: '' }, dataPoints },
    ]

    backendSpy.getGroupedByAlias.and.returnValue(of(measurements))

    service.computeStats(group, now, now).subscribe((result) => {
      // count
      expect(result.count).toBe(3)
      // mean = 20
      expect(result.mean).toBeCloseTo(20, 5)
      // median = 20
      expect(result.median).toBeCloseTo(20, 5)
      // min
      expect(result.min).toBe(10)
      // max
      expect(result.max).toBe(30)
      // variance = ((100 + 0 + 100) / 3) = 66.6667
      expect(result.variance).toBeCloseTo(66.6667, 4)
      // stdDev = sqrt(variance)
      expect(result.stdDev).toBeCloseTo(Math.sqrt(66.6667), 4)
      // quartiles
      expect(result.p25).toBeCloseTo(15, 5)
      expect(result.p75).toBeCloseTo(25, 5)
      expect(result.iqr).toBeCloseTo(10, 5)
      // trend: increasing sequence => positive slope
      expect(result.trend).toBeGreaterThan(0)
      // series correct mapping
      expect(result.series.length).toBe(1)
      const ser: Series = result.series[0]
      expect(ser.points.length).toBe(3)
      const yValues = ser.points.map((p: ScatterDataPoint) => p.y)
      expect(yValues).toEqual([10, 20, 30])

      expect(backendSpy.getGroupedByAlias).toHaveBeenCalledTimes(1)
      done()
    })
  })

  it('should compute correlation of perfectly correlated groups as 1', (done) => {
    const now = new Date()
    const groupA: SensorGroup = { sensors: [{ measurementName: 'm', sensorName: 'a', alias: 'c' }] }
    const groupB: SensorGroup = { sensors: [{ measurementName: 'm', sensorName: 'a', alias: 'c' }] }
    const data = [
      { timestamp: now.toISOString(), value: 5 },
      { timestamp: now.toISOString(), value: 15 },
      { timestamp: now.toISOString(), value: 25 },
    ]
    const measurements: Measurement[] = [
      { measurementName: 'm', sensor: { id: 'a', name: 'a', location: '' }, dataPoints: data },
    ]

    backendSpy.getGroupedByAlias.and.returnValue(of(measurements))

    service.computeCorrelation(groupA, groupB, now, now).subscribe((corr) => {
      expect(corr).toBeCloseTo(1, 5)
      done()
    })
  })

  it('quantile should interpolate correctly', () => {
    const sorted = [0, 10, 20, 30, 40]
    // median
    const median = service['quantile'](sorted, 0.5)
    expect(median).toBe(20)
    // 25th percentile: pos = 1 => 10
    const q25 = service['quantile'](sorted, 0.25)
    expect(q25).toBe(10)
    // non-integer pos, e.g. q=0.1 -> pos=0.4 => 0 + 0.4*(10-0)=4
    const q10 = service['quantile'](sorted, 0.1)
    expect(q10).toBeCloseTo(4, 5)
  })

  it('computeTrend should return zero for insufficient data', () => {
    expect(service['computeTrend']([])).toBe(0)
    expect(service['computeTrend']([5])).toBe(0)
  })

  it('computeTrend should compute positive slope for increasing data', () => {
    const trend = service['computeTrend']([1, 2, 3, 4])
    expect(trend).toBeGreaterThan(0)
  })

  it('computeTrend should compute negative slope for decreasing data', () => {
    const trend = service['computeTrend']([4, 3, 2, 1])
    expect(trend).toBeLessThan(0)
  })

  it('should detect low and high outliers correctly via public API', (done) => {
    // Prepare a synthetic StatisticResult with one low and one high outlier
    const now = Date.now()
    const points = [
      { x: now, y: -10 }, // low outlier (below lower)
      { x: now + 1, y: 10 },
      { x: now + 2, y: 20 },
      { x: now + 3, y: 50 }, // high outlier (above upper)
    ]
    const p25 = 10
    const p75 = 20
    const stats: StatisticResult = {
      count: 4,
      mean: 7.5,
      median: 15,
      min: -10,
      max: 50,
      variance: 650,
      stdDev: Math.sqrt(650),
      p25,
      p75,
      iqr: p75 - p25,
      trend: 0,
      series: [{ measurementName: 'test', sensorName: 's', points }],
    }

    // Stub computeStats to return our synthetic stats
    spyOn<StatsService, 'computeStats'>(service, 'computeStats').and.returnValue(of(stats))
    const dummyGroup: SensorGroup = {
      sensors: [{ measurementName: 't', sensorName: 's', alias: 'a' }],
    }
    const from = new Date()
    const to = new Date()

    service.detectOutliers(dummyGroup, from, to).subscribe((anomalies) => {
      expect(anomalies.length).toBe(2)
      const types = anomalies.map((a) => a.type).sort()
      expect(types).toEqual(['high', 'low'])
      const values = anomalies.map((a) => a.value).sort((a, b) => a - b)
      expect(values).toEqual([-10, 50])
      done()
    })
  })
})
