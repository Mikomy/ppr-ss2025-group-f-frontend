import { Component, OnInit } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { CommonModule } from '@angular/common'
import { BackendService } from '../../services/backend.service'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatDividerModule } from '@angular/material/divider'
import { SensorData } from '../../models/sensorData.model'
import { Statistics } from '../../models/statistics.model'

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
})
export class HomePageComponent implements OnInit {
  statistics: Statistics | undefined

  // This object groups measurements by sensor location.
  measurementsByLocation: Record<string, MeasurementDisplay[]> = {}

  constructor(private backendService: BackendService) {}

  ngOnInit(): void {
    this.loadMeasurements()
    // this.loadStatistics();
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
