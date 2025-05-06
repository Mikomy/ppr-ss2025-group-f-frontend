import { Injectable } from '@angular/core'
import { Observable, forkJoin } from 'rxjs'
import { map } from 'rxjs/operators'
import { BackendService } from '../../services/backend.service'
import { SensorGroup, StatisticResult, Series } from '../../models/stats.model'
import { Measurement } from '../../models/measurement.model'
import { ScatterDataPoint } from 'chart.js'

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private backend: BackendService) {}

  /**
   * Compute statistics for each sensor in the group over the given time range.
   * Falls back to the first measurement if sensor-specific data is missing.
   */
  computeStats(group: SensorGroup, from: Date, to: Date): Observable<StatisticResult> {
    const isoFrom = from.toISOString()
    const isoTo = to.toISOString()

    // Fetch measurements per configured measurementName
    const calls = group.sensors.map((sensorConfig) =>
      this.backend.getMeasurement(sensorConfig.measurementName, isoFrom, isoTo)
    )

    return forkJoin(calls).pipe(
      map((allMeasurements: Measurement[][]) => {
        const series: Series[] = group.sensors.map((sensorConfig, idx) => {
          const measurementsForName = allMeasurements[idx] || []
          // Try find by sensorId, else fallback to first element
          const measurement =
            measurementsForName.find((m) => m.sensor.id === sensorConfig.sensorId) ??
            measurementsForName[0]

          const rawPoints = measurement?.dataPoints || []
          const points: ScatterDataPoint[] = rawPoints.map((dp) => ({
            x: new Date(dp.timestamp).getTime(),
            y: dp.value,
          }))

          return {
            measurementName: sensorConfig.measurementName,
            sensorName: sensorConfig.measurementName,
            points,
          }
        })

        // Aggregate all y-values
        const allValues = series
          .flatMap((serie) => serie.points.map((p) => p.y))
          .sort((a, b) => a - b)

        const count = allValues.length
        const mean = count ? allValues.reduce((sum, v) => sum + v, 0) / count : 0
        const median = this.quantile(allValues, 0.5)
        const min = count ? allValues[0] : 0
        const max = count ? allValues[count - 1] : 0
        const variance = count
          ? allValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count
          : 0
        const stdDev = Math.sqrt(variance)
        const p25 = this.quantile(allValues, 0.25)
        const p75 = this.quantile(allValues, 0.75)
        const iqr = p75 - p25
        const trend = this.computeTrend(allValues)

        return {
          count,
          mean,
          median,
          min,
          max,
          variance,
          stdDev,
          p25,
          p75,
          iqr,
          trend,
          series,
        }
      })
    )
  }

  /**
   * Compute Pearson correlation between two sensor groups.
   */
  computeCorrelation(g1: SensorGroup, g2: SensorGroup, from: Date, to: Date): Observable<number> {
    return forkJoin({
      s1: this.computeStats(g1, from, to),
      s2: this.computeStats(g2, from, to),
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

  private computeTrend(vals: number[]): number {
    const n = vals.length
    if (n < 2) return 0
    const xMean = (n - 1) / 2
    const yMean = vals.reduce((s, v) => s + v, 0) / n
    const num = vals.reduce((sum, y, i) => sum + (i - xMean) * (y - yMean), 0)
    const den = vals.reduce((sum, _, i) => sum + Math.pow(i - xMean, 2), 0)
    return den ? num / den : 0
  }
}
