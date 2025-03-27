import { Injectable } from '@angular/core';
import { SensorMeasurement } from '../models/sensorMeasurement';
import { fakeAccounts} from '../models/fake-database';
import {map, Observable, of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {

  //private apiUrl = 'http://localhost:8080/api/sensors';


  getLatestMeasurements(): Observable<SensorMeasurement[]> {
    return of(fakeAccounts).pipe(
      map(data => data.map(data => ({
        sensorName: data.sensorName,
        value: data.value,
        unit: data.unit
      })))
    );

  }
}
