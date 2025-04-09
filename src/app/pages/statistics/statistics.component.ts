import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorDataService } from '../../services/sensorData.service';
import { InfluxPoint } from '../../models/InfluxPoint';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
})
export class StatisticsComponent implements OnInit {
  dataPoints: InfluxPoint[] = [];

  constructor(private sensorDataService: SensorDataService) {}

  ngOnInit(): void {
    this.loadInfluxData('device_frmpayload_data_data_Humidity');
  }

  loadInfluxData(measurementType: string): void {
    console.log('Attempting to load data from service');
    this.sensorDataService.getInfluxPoints(measurementType, 0, 0).subscribe({
      next: (data) => {
        console.log('Data received:', data);
        if (data && data.length > 0) {
          this.dataPoints = data;
        } else {
          console.warn('Received empty data array from service');
        }
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }
}
