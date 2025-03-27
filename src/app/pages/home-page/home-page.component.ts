import {Component, OnInit} from '@angular/core';
import { SensorMeasurement} from '../../models/sensorMeasurement';
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
  measurements: SensorMeasurement[] = [];

  constructor(private sensorDataService: SensorDataService) { }

  ngOnInit(): void {
    this.fetchMeasurements();
  }

  fetchMeasurements(): void {
    this.sensorDataService.getLatestMeasurements().subscribe({
      next: (data: SensorMeasurement[]) => this.measurements = data,
      error: err => console.error('Error fetching measurements:', err)
    });
  }
}
