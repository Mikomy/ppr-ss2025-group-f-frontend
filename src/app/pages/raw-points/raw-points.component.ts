import { Component, OnInit } from '@angular/core';
import { SensorDataService } from '../../services/sensorData.service';
import { CommonModule } from '@angular/common';
import { InfluxPoint } from '../../models/InfluxPoint';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-raw-points',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './raw-points.component.html',
  styleUrl: './raw-points.component.scss'
})
export class RawPointsComponent implements OnInit {

  dataPoints: InfluxPoint[] = [];
  countDataPoints: number = 0;
  chosenMeasurement: string = '';
  currentPage: number = 1;
  pageSize: number = 100;

  constructor(private sensorDataService: SensorDataService, private route: ActivatedRoute, private router: Router) {}
  ngOnInit(): void {
    const measurementName = this.route.snapshot.paramMap.get('id');
    console.log('Measurement name from route:', measurementName);
    if ( ! measurementName) {
      return;
    }
    this.chosenMeasurement = measurementName;
    this.sensorDataService.countInfluxPoints( measurementName ).subscribe({
      next: (count) => {
        this.countDataPoints = count;
      }
    });

    this.loadPoints( measurementName, this.currentPage, this.pageSize );
  }

  loadPoints( measurementName : string, page: number, pageSize: number ): void {
    console.log('Attempting to load data from service with pagination');
    this.sensorDataService.getInfluxPoints( measurementName, page, pageSize ).subscribe({
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
      }
    });
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadPoints(this.chosenMeasurement, this.currentPage, this.pageSize);
  }

  roundDown(value: number): number {
    return Math.floor(value);
  }

}
