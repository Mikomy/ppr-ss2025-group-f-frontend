import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorDataService } from '../../services/sensorData.service';
import { InfluxMeasurement } from '../../models/InfluxMeasurement';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent implements OnInit {

  measurements: InfluxMeasurement[] = [];

  constructor(private sensorDataService: SensorDataService) {}

  ngOnInit(): void {
    this.loadInfluxData( 'data_Humidity' );
  }


  loadInfluxData( measurementType : string ): void {
    console.log('Attempting to load data from service');
    this.sensorDataService.getInfluxMeasurements( measurementType ).subscribe({
      next: (data) => {
        console.log('Data received:', data);
        if (data && data.length > 0) {
          this.measurements = data;
        } else {
          console.warn('Received empty data array from service');
        }
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      }
    });
  }
}
