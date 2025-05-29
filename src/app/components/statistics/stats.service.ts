import { Injectable } from '@angular/core'
import { Observable, forkJoin, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { BackendService } from '../../services/backend.service'
import { SensorGroup, StatisticResult, Series } from '../../models/stats.model'
import { Measurement } from '../../models/measurement.model'
import { ScatterDataPoint } from 'chart.js'
import { Anomaly } from '../../models/anomaly.model'
import { QuickRangeKey } from '../../models/quickRange.enum'

/**
 * Service responsible for fetching sensor measurements
 * and computing basic statistics and correlations over time ranges.
 */
@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private backend: BackendService) {}

  /**
   * Fetches measurement data for each sensor in the group
   * over the specified time interval, then computes:
   *  - count, mean, median, min, max, variance, stdDev, IQR, trend
   *  - series: the raw points per sensor as ScatterDataPoint[]
   *
   * If no sensors are provided, returns an empty statistics result.
   *
   * @param group  SensorGroup containing measurementName + sensorId list
   * @param from   Start Date (inclusive)
   * @param to     End Date (inclusive)
   * @param quickRange
   * @returns      Observable of the computed StatisticResult
   */
  computeStats(
    group: SensorGroup,
    from?: Date,
    to?: Date,
    quickRange?: QuickRangeKey
  ): Observable<StatisticResult> {
    if (!group.sensors.length) {
      return of({
        count: 0,
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        variance: 0,
        stdDev: 0,
        p25: 0,
        p75: 0,
        iqr: 0,
        trend: 0,
        series: [],
      })
    }

    const alias = group.sensors[0].alias
    const isoFrom = from?.toISOString()
    const isoTo = to?.toISOString()

    // One HTTP call for the whole measurement (all sensors)
    return this.backend.getGroupedByAlias(alias, isoFrom, isoTo, quickRange).pipe(
      map((all: Measurement[]) => {
        console.log('>>> group.sensors:', group.sensors)
        console.log('>>> group.alias:', alias)
        console.log(
          'geladene Sensor-Namen:',
          all.map((m) => m.sensor.name)
        )
        console.log(
          'erwartete Sensor-Namen:',
          group.sensors.map((s) => s.sensorName)
        )
        // Build series only for sensors we care about
        const series: Series[] = group.sensors.map(({ sensorName, measurementName }) => {
          const m = all.find((x) => x.sensor.name === sensorName)
          const points: ScatterDataPoint[] =
            m?.dataPoints.map((dp) => ({
              x: new Date(dp.timestamp).getTime(),
              y: dp.value,
            })) ?? []
          return { measurementName, sensorName, points }
        })

        // flatten & sort
        const vals = series.flatMap((s) => s.points.map((p) => p.y)).sort((a, b) => a - b)
        const n = vals.length
        const mean = n ? vals.reduce((s, v) => s + v, 0) / n : 0

        return {
          count: n,
          mean,
          median: this.quantile(vals, 0.5),
          min: n ? vals[0] : 0,
          max: n ? vals[n - 1] : 0,
          variance: n ? vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n : 0,
          stdDev: Math.sqrt(n ? vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n : 0),
          p25: this.quantile(vals, 0.25),
          p75: this.quantile(vals, 0.75),
          iqr: this.quantile(vals, 0.75) - this.quantile(vals, 0.25),
          trend: this.computeTrend(vals),
          series,
        }
      })
    )
  }

  /**
   * Computes the Pearson correlation coefficient between
   * two sensor groups over the same time interval.
   *
   * @param g1   First SensorGroup
   * @param g2   Second SensorGroup
   * @param from Start Date
   * @param to   End Date
   * @param quickRange
   * @returns    Observable<number> correlation in [-1,1]
   */
  computeCorrelation(
    g1: SensorGroup,
    g2: SensorGroup,
    from?: Date,
    to?: Date,
    quickRange?: QuickRangeKey
  ): Observable<number> {
    return forkJoin({
      s1: this.computeStats(g1, from, to, quickRange),
      s2: this.computeStats(g2, from, to, quickRange),
    }).pipe(
      map(({ s1, s2 }) => {
        const x = s1.series.flatMap((sr) => sr.points.map((p) => p.y))
        const y = s2.series.flatMap((sr) => sr.points.map((p) => p.y))
        const n = Math.min(x.length, y.length)
        if (n === 0) return 0

        const mx = x.slice(0, n).reduce((s, v) => s + v, 0) / n
        const my = y.slice(0, n).reduce((s, v) => s + v, 0) / n

        const num = x.slice(0, n).reduce((acc, xi, i) => acc + (xi - mx) * (y[i] - my), 0)
        const denX = Math.sqrt(x.slice(0, n).reduce((s, xi) => s + Math.pow(xi - mx, 2), 0))
        const denY = Math.sqrt(y.slice(0, n).reduce((s, yi) => s + Math.pow(yi - my, 2), 0))

        return denX && denY ? num / (denX * denY) : 0
      })
    )
  }
  /**
   * Returns the q-th quantile (0 ≤ q ≤ 1) of a sorted numeric array.
   * If q maps between two data points, linearly interpolates.
   */
  private quantile(sorted: number[], q: number): number {
    const n = sorted.length
    if (!n) return 0
    const pos = (n - 1) * q
    const base = Math.floor(pos)
    const rest = pos - base
    return sorted[base + 1] !== undefined
      ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
      : sorted[base]
  }

  /**
   * Computes the slope (trend) of a simple linear regression line
   * fitted to the provided values (equally spaced on the x-axis).
   */
  private computeTrend(vals: number[]): number {
    const n = vals.length
    if (n < 2) return 0
    const xMean = (n - 1) / 2
    const yMean = vals.reduce((s, v) => s + v, 0) / n
    const num = vals.reduce((sum, y, i) => sum + (i - xMean) * (y - yMean), 0)
    const den = vals.reduce((sum, _, i) => sum + Math.pow(i - xMean, 2), 0)
    return den ? num / den : 0
  }

  /**
   * Detects outliers (anomalies) in the given sensor group over a time range.
   * Uses IQR rule: values below p25 - 1.5*IQR or above p75 + 1.5*IQR are flagged.
   * On any error, returns an empty array.
   *
   * @param group   SensorGroup to analyze
   * @param from    Start date (inclusive)
   * @param to      End date (inclusive)
   * @param quickRange
   * @returns       Observable emitting array of Anomaly objects
   */
  detectOutliers(
    group: SensorGroup,
    from?: Date,
    to?: Date,
    quickRange?: QuickRangeKey
  ): Observable<Anomaly[]> {
    return this.computeStats(group, from, to, quickRange).pipe(
      map((stats) => this.findOutliers(stats)),
      catchError(() => of([]))
    )
  }

  /**
   * Extracts anomalies from a fully-computed StatisticResult.
   *
   * @param stats   Pre-computed statistics including series and quartiles
   * @returns       List of anomalies (each with timestamp, value, and 'low'|'high' type)
   */
  findOutliers(stats: StatisticResult): Anomaly[] {
    const { series, p25, p75 } = stats
    const iqr = p75 - p25
    const lower = p25 - 1.5 * iqr
    const upper = p75 + 1.5 * iqr

    return series.flatMap((s) =>
      s.points
        .filter((p) => p.y < lower || p.y > upper)
        .map((p) => ({ timestamp: new Date(p.x), value: p.y, type: p.y < lower ? 'low' : 'high' }))
    )
  }
}
