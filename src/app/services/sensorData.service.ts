import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InfluxPoint } from '../models/InfluxPoint';
import {map, Observable, of, catchError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  constructor(private http: HttpClient) {}

  //private apiUrl = 'http://localhost:8080/api/sensors';

  private localInfluxUrl = 'http://localhost:8086/query';

  // http://localhost:8086/query?db=nexus&q=SHOW%20MEASUREMENTS
  getInfluxMeasurements(): Observable<String[]> {
    const params = {
      db: 'nexus',
      q: 'SHOW MEASUREMENTS'
    };

    return this.http.get<any>(this.localInfluxUrl, { params }).pipe(
      map(response => {
        console.log('Raw Influx response for measurements:', response);

        try {
          if (response && response.results && response.results[0] && response.results[0].series && response.results[0].series[0]) {
            const series = response.results[0].series[0];
            const values: string[] = series.values.flat(); // Flatten to get a string array

            // Return the measurement names directly
            return values;
          }

          console.warn('Unexpected Influx response format for measurements:', response);
          return [];
        } catch (error) {
          console.error('Error parsing Influx measurements data:', error);
          return [];
        }
      }),
      catchError(error => {
        console.error('HTTP error from Influx for measurements:', error);
        return of([]);
      })
    );
  }

  countInfluxPoints(measurementName: String): Observable<number> {
    const params = {
      db: 'nexus',
      q: `SELECT COUNT("value") FROM "${measurementName}"`
    };

    console.log('Querying Influx for count with:', params);

    return this.http.get<any>(this.localInfluxUrl, { params }).pipe(
      map(response => {
        console.log('Raw Influx response for count:', response);

        try {
          if (response && response.results && response.results[0] && response.results[0].series && response.results[0].series[0]) {
            const series = response.results[0].series[0];
            const values = series.values;

            // Extract the count value from the response
            if (values && values[0] && values[0][1] !== undefined) {
              return values[0][1];
            }
          }

          console.warn('Unexpected Influx response format for count:', response);
          return 0;
        } catch (error) {
          console.error('Error parsing Influx count data:', error);
          return 0;
        }
      }),
      catchError(error => {
        console.error('HTTP error from Influx for count:', error);
        return of(0);
      })
    );
  }

  getInfluxPoints(measureMentType: string, page: number, pageSize: number): Observable<InfluxPoint[]> {
    const offset = (page - 1) * pageSize;
    const params = {
      db: 'nexus',
      q: `SELECT "time", "value" FROM "${measureMentType}" LIMIT ${pageSize} OFFSET ${offset}`
    };

    console.log('Querying Influx with:', params);

    return this.http.get<any>(this.localInfluxUrl, { params }).pipe(
      map(response => {
        console.log('Raw Influx response:', response);

        try {
          if (response && response.results && response.results[0] && response.results[0].series && response.results[0].series[0]) {
            const series = response.results[0].series[0];
            const columns = series.columns;
            const values = series.values;

            return values.map((value: any[]) => {
              const measurement: InfluxPoint = {
                sensorName: series.name || 'Unknown Sensor',
                value: parseFloat(value[1]),
                timestamp: value[0]
              };
              return measurement;
            });
          }

          console.warn('Unexpected Influx response format:', response);
          return [];
        } catch (error) {
          console.error('Error parsing Influx data:', error);
          return [];
        }
      }),
      catchError(error => {
        console.error('HTTP error from Influx:', error);
        return of([]);
      })
    );
  }
}
