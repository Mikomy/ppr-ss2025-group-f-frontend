import { Component, OnInit } from '@angular/core';
import { SensorDataService } from '../../services/sensorData.service';
import { CommonModule } from '@angular/common';
import { InfluxPoint } from '../../models/InfluxPoint';


@Component({
  selector: 'app-raw-influx-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './raw-influx-data.component.html',
  styleUrl: './raw-influx-data.component.scss'
})
export class RawInfluxDataComponent  implements OnInit {
  
    
  measurements: String[] = [];
  constructor(private sensorDataService: SensorDataService) {}

  ngOnInit(): void {
    this.getMeasurements();
  }

  getMeasurements(): void {
    this.sensorDataService.getInfluxMeasurements().subscribe({
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
