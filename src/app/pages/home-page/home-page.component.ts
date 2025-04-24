import { Component, OnInit } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { CommonModule } from '@angular/common'
import { BackendService } from '../../services/backend.service'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatDividerModule } from '@angular/material/divider'
import { SensorData } from '../../models/sensorData.model'
import { Statistics } from '../../models/statistics.model'

// DEUTSCH Übersetzung ermöglichen
import localeDe from '@angular/common/locales/de'
import { LOCALE_ID, OnDestroy } from '@angular/core'
import { registerLocaleData } from '@angular/common'
registerLocaleData(localeDe)
// DEUTSCH Übersetzung ermöglichen

interface MeasurementDisplay {
  name: string
  latestData: SensorData | null
}
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatGridListModule, MatDividerModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }], // DEUTSCH Übersetzung ermöglichen
})
export class HomePageComponent implements OnInit, OnDestroy {
  statistics: Statistics | undefined
  measurementsByLocation: Record<string, MeasurementDisplay[]> = {}
  private statisticsIntervalId: ReturnType<typeof setInterval> | undefined // Timer-ID speichern
  statisticsError: string | null = null // Fehlernachricht

  constructor(private backendService: BackendService) {}

  ngOnInit(): void {
    this.loadMeasurements()
    this.loadStatistics()
    // Alle 30 Sekunden loadStatistics erneut ausführen
    this.statisticsIntervalId = setInterval(() => {
      this.loadStatistics()
    }, 3000)
    console.table(this.statistics)
  }

  // Optional: Timer beim Zerstören der Komponente aufräumen
  ngOnDestroy(): void {
    if (this.statisticsIntervalId) {
      clearInterval(this.statisticsIntervalId)
    }
  }

  loadStatistics() {
    try {
      // Hilfsfunktion für Zufallsdaten
      function generateRandomDataPoints(
        count: number,
        min: number,
        max: number,
        startDate: string
      ): { timestamp: string; value: number }[] {
        const points = []
        const date = new Date(startDate)
        for (let i = 0; i < count; i++) {
          points.push({
            timestamp: date.toISOString(),
            value: +(Math.random() * (max - min) + min).toFixed(1),
          })
          date.setDate(date.getDate() + 1)
        }
        return points
      }

      this.statistics = {
        averageTemperature: 21.5,
        averageHumidity: 45.2,
        count: 1200,
        oldestMeasurement: {
          measurementName: 'device_frmpayload_data_air_humidity_value',
          sensor: {
            name: 'Decentlab DL-LP8P Multisensor',
            id: 'decentlab-dl-lp8p',
            location: 'Nexus',
          },
          dataPoints: generateRandomDataPoints(1, 20, 60, '2020-01-02T09:00:00Z'),
        },
        newestMeasurement: {
          measurementName: 'device_frmpayload_data_co2_concentration_value',
          sensor: {
            name: 'Decentlab DL-LP8P Multisensor',
            id: 'decentlab-dl-lp8p',
            location: 'Nexus',
          },
          dataPoints: generateRandomDataPoints(1, 300, 500, '2025-04-25T09:00:00Z'),
        },
        lowestTemperature: {
          measurementName: 'device_frmpayload_data_air_temperature_value',
          sensor: {
            name: 'Decentlab DL-LP8P Multisensor',
            id: 'decentlab-dl-lp8p',
            location: 'Nexus',
          },
          dataPoints: generateRandomDataPoints(1, 10, 15, '2023-04-03T09:00:00Z'),
        },
        highestTemperature: {
          measurementName: 'device_frmpayload_data_air_temperature_value',
          sensor: {
            name: 'Decentlab DL-LP8P Multisensor',
            id: 'decentlab-dl-lp8p',
            location: 'Nexus',
          },
          dataPoints: generateRandomDataPoints(1, 30, 40, '2022-04-03T09:00:00Z'),
        },
        lowestHumidity: {
          measurementName: 'device_frmpayload_data_air_humidity_value',
          sensor: {
            name: 'Decentlab DL-LP8P Multisensor',
            id: 'decentlab-dl-lp8p',
            location: 'Nexus',
          },
          dataPoints: generateRandomDataPoints(1, 10, 30, '2021-11-02T09:00:00Z'),
        },
        highestHumidity: {
          measurementName: 'device_frmpayload_data_air_humidity_value',
          sensor: {
            name: 'Decentlab DL-LP8P Multisensor',
            id: 'decentlab-dl-lp8p',
            location: 'Nexus',
          },
          dataPoints: generateRandomDataPoints(1, 70, 80, '2025-07-12T09:00:00Z'),
        },
      } as Statistics
      this.statisticsError = null // Fehler zurücksetzen, falls erfolgreich
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      this.statisticsError = 'Fehler beim Laden der Statistiken: ' + errMsg
      this.statistics = undefined
    }
  }

  // loadStatistics() {
  //   this.backendService.getStatistics().subscribe({
  //     next: (data: Statistics) => {
  //       this.statistics = data;
  //     },
  //     error: (error) => console.error('Error loading statistics', error)
  //   });
  // }

  private loadMeasurements(): void {
    //   // Subscribe individually and log the data
    //   this.backendService.getSoilMoistrue().subscribe({
    //     next: (data) => {
    //       console.log('Soil Moisture:', data)
    //       this.addMeasurement(data)
    //     },
    //     error: (err) => console.error('Error getting soil moisture:', err),
    //   })
    //
    //   this.backendService.getPhosphorData().subscribe({
    //     next: (data) => {
    //       console.log('Phosphorus:', data)
    //       this.addMeasurement(data)
    //     },
    //     error: (err) => console.error('Error getting phosphorus data:', err),
    //   })
    //
    //   this.backendService.getNitrogenData().subscribe({
    //     next: (data) => {
    //       console.log('Nitrogen:', data)
    //       this.addMeasurement(data)
    //     },
    //     error: (err) => console.error('Error getting nitrogen data:', err),
    //   })
    //
    //   this.backendService.getHumidityData().subscribe({
    //     next: (data) => {
    //       console.log('Humidity:', data)
    //       this.addMeasurement(data)
    //     },
    //     error: (err) => console.error('Error getting humidity data:', err),
    //   })
    //
    //   this.backendService.getRoomTemperatureData().subscribe({
    //     next: (data) => {
    //       console.log('Room Temperature:', data)
    //       this.addMeasurement(data)
    //     },
    //     error: (err) => console.error('Error getting room temperature data:', err),
    //   })
    //
    //   // Log the grouped measurements after a short delay for debugging.
    //   setTimeout(() => {
    //     console.log('Grouped measurements by location:', this.measurementsByLocation)
    //   }, 1000)
  }
  //
  // private addMeasurement(measurement: Measurement): void {
  //   if (!measurement || !measurement.sensor || !measurement.sensor.location) {
  //     console.warn('Invalid measurement received:', measurement)
  //     return
  //   }
  //   const location = measurement.sensor.location
  //   const latestData =
  //     measurement.dataPoints && measurement.dataPoints.length > 0
  //       ? this.getLatestData(measurement.dataPoints)
  //       : null
  //   if (!this.measurementsByLocation[location]) {
  //     this.measurementsByLocation[location] = []
  //   }
  //   this.measurementsByLocation[location].push({
  //     name: measurement.measurementName,
  //     latestData: latestData,
  //   })
  // }
  //
  // private getLatestData(dataPoints: SensorData[]): SensorData | null {
  //   if (!dataPoints || dataPoints.length === 0) {
  //     return null
  //   }
  //   return dataPoints.reduce(
  //     (latest, current) =>
  //       new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest,
  //     dataPoints[0]
  //   )
  // }
}
