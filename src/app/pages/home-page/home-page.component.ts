import {Component, OnInit} from '@angular/core';
import { SensorMeasurement} from '../../models/sensorMeasurement';
import { InfluxMeasurement } from '../../models/InfluxMeasurement';
import { SensorDataService } from '../../services/sensorData.service';
import { MatCardModule, MatCardContent, MatCardHeader} from '@angular/material/card';
import { CommonModule} from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatCardHeader,
    CommonModule,
    MatCardContent
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})


export class HomePageComponent  implements OnInit {
  measurements:       SensorMeasurement[] = [];
  influxMeasurement:  InfluxMeasurement[] = [];

  constructor(private sensorDataService: SensorDataService) { }

  ngOnInit(): void {
    this.fetchMeasurements();
    this.fetchInfluxMeasurement();
  }


  fetchMeasurements(): void {
    this.sensorDataService.getLatestMeasurements().subscribe({
      next: (data: SensorMeasurement[]) => this.measurements = data,
      error: err => console.error('Error fetching measurements:', err)
    });
  }

  fetchInfluxMeasurement(): void {
    this.sensorDataService.getInfluxMeasurements( "data_Humidity" ).subscribe({
      next: (data: InfluxMeasurement[]) => {
        this.influxMeasurement = data;
        console.log('Fetched Influx Measurement:', this.influxMeasurement);
      },
      error: (err) => {
        console.error('Error fetching influxMeasurement:', err);
      }
    });
  }


  
} // end class HomePageComponent
