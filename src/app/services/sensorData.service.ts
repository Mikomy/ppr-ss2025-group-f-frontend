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

  getInfluxMeasurements(measureMentType: string): Observable<InfluxPoint[]> {
    const params = {
      db: 'test_db',
      q: `SELECT "time", "value" FROM "device_frmpayload_data_${measureMentType}"`
    };

    console.log('Querying Influx with:', params);

    return this.http.get<any>(this.localInfluxUrl, { params }).pipe(
      map(response => {
        console.log('Raw Influx response:', response);

        // Handle potential response formats from Influx
        // This is needed because Influx might return data in different formats
        try {
          if (response && response.results && response.results[0] && response.results[0].series && response.results[0].series[0]) {
            const series  = response.results[0].series[0];
            const columns = series.columns;
            const values  = series.values;

            // Map the influx data to our InfluxMeasurement model
            return values.map((value: any[]) => {
              const measurement: InfluxPoint = {
                sensorName: series.name || 'Unknown Sensor',
                value: parseFloat(value[1]),
                timestamp: value[0]
              };
              return measurement;
            });
          }

          // If the response doesn't match expected format, return empty array
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
