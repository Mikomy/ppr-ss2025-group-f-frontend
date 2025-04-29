import { Injectable } from '@angular/core'
import { Observable, forkJoin } from 'rxjs'
import { map } from 'rxjs/operators'
import { BackendService } from '../../services/backend.service'
import { SensorGroup, StatisticResult } from '../../models/stats.model'
import { Measurement } from '../../models/measurement.model'

interface DataPoint {
  timestamp: string
  value: number
}
@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private backend: BackendService) {}

  /** Kennzahlen für eine Sensorgruppe im Zeitraum */
  computeStats(group: SensorGroup, from: Date, to: Date): Observable<StatisticResult> {
    const isoFrom = this.toIso(from)
    const isoTo = this.toIso(to)

    // 1) Array an Observables<Measurement[]>
    const calls = group.sensors.map((s) =>
      this.backend.getMeasurement(s.measurementName, isoFrom, isoTo)
    )

    // 2) forkJoin liefert Measurement[][] (ein Array pro Sensor)
    return forkJoin(calls).pipe(
      map((arrays: Measurement[][]) => {
        // 3) Helper zieht alle DataPoints raus
        const allPoints = this.flattenDataPoints(arrays)
        // 4) Kennzahlen aggregieren
        return this.aggregate(allPoints)
      })
    )
  }

  /** Pearson-Korrelation zweier Sensorgruppen */
  computeCorrelation(g1: SensorGroup, g2: SensorGroup, from: Date, to: Date): Observable<number> {
    const isoFrom = this.toIso(from)
    const isoTo = this.toIso(to)

    // je Gruppe ein forkJoin-Observable, das Measurement[][] zurückliefert
    const groupObs1 = forkJoin(
      g1.sensors.map((s) => this.backend.getMeasurement(s.measurementName, isoFrom, isoTo))
    )
    const groupObs2 = forkJoin(
      g2.sensors.map((s) => this.backend.getMeasurement(s.measurementName, isoFrom, isoTo))
    )

    // beide Gruppen parallel ausführen
    return forkJoin([groupObs1, groupObs2]).pipe(
      map(([arr1, arr2]: [Measurement[][], Measurement[][]]) => {
        // flache Datenpunkte beider Gruppen
        const dp1 = this.flattenDataPoints(arr1)
        const dp2 = this.flattenDataPoints(arr2)
        // Korrelation berechnen
        return this.corr(dp1, dp2)
      })
    )
  }

  /** Extrahiert DataPoint[] aus verschachteltem Measurement[][] */
  private flattenDataPoints(groups: Measurement[][]): DataPoint[] {
    return groups.flatMap((measurements) => measurements.flatMap((m) => m.dataPoints))
  }

  /** Aggregiert DataPoint[] zu Kennzahlen */
  private aggregate(points: DataPoint[]): StatisticResult {
    const values = points.map((p) => p.value)
    const n = values.length
    const mean = values.reduce((a, b) => a + b, 0) / n
    const min = Math.min(...values)
    const max = Math.max(...values)
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n
    const stdDev = Math.sqrt(variance)
    const trend = this.trend(values)
    return { mean, min, max, stdDev, trend }
  }

  /** Lineare Trend-Steigung */
  private trend(vals: number[]): number {
    const n = vals.length
    const xMean = (n - 1) / 2
    const yMean = vals.reduce((a, b) => a + b, 0) / n
    const num = vals.reduce((sum, y, i) => sum + (i - xMean) * (y - yMean), 0)
    const den = vals.reduce((sum, _, i) => sum + (i - xMean) ** 2, 0)
    return num / den
  }

  /** Pearson-Koeffizient */
  private corr(a: DataPoint[], b: DataPoint[]): number {
    const x = a.map((p) => p.value)
    const y = b.map((p) => p.value)
    const n = Math.min(x.length, y.length)
    const mx = x.slice(0, n).reduce((s, v) => s + v, 0) / n
    const my = y.slice(0, n).reduce((s, v) => s + v, 0) / n
    const num = x.slice(0, n).reduce((sum, xi, i) => sum + (xi - mx) * (y[i] - my), 0)
    const denX = Math.sqrt(x.slice(0, n).reduce((s, xi) => s + (xi - mx) ** 2, 0))
    const denY = Math.sqrt(y.slice(0, n).reduce((s, yi) => s + (yi - my) ** 2, 0))
    return num / (denX * denY)
  }

  /** Helfer zum ISO-String */
  private toIso(d: string | Date): string {
    return typeof d === 'string' ? d : d.toISOString()
  }
}
