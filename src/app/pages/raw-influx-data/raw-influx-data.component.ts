import { Component, OnInit } from '@angular/core';
import { SensorDataService } from '../../services/sensorData.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-raw-influx-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './raw-influx-data.component.html',
  styleUrl: './raw-influx-data.component.scss',
})
export class RawInfluxDataComponent implements OnInit {
  measurements: String[] = [];
  constructor(
    private sensorDataService: SensorDataService,
    private router: Router
  ) {}

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
      },
    });
  }

  showDetails(measurementName: String): void {
    this.router.navigate(['/raw-points', measurementName]);
  }

  /**
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * DON'T USE THIS FUNCTION
   * This will kill your machine
   * Cause you make a count query for each measurement
   * and it will take a long time
   * and it will take a long time
   * and it will take a long time
   * and it will take a long time
   * and it will take a long time
   * and it will take a long time
   * @param measurementName DON'T USE THIS FUNCTION
   */
  countPoints(measurementName: String): void {
    this.sensorDataService.countInfluxPoints(measurementName).subscribe({
      next: (count) => {
        return count;
      },
      error: (error) => {
        console.error('Error fetching count:', error);
        return 0;
      },
    });
  }
}
