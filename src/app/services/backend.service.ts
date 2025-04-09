import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  fakeData,
  fakeSoilMoisture,
  fakePhosphorus,
  fakeNitrogen,
  fakeHumidity,
  fakeRoomTemperature,
} from '../models/fake-database/fake-data';

import { Measurement } from '../models/measurement.model';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  getStatus(): Observable<string> {
    return of(fakeData).pipe(catchError(this.handleError<string>('getStatus')));
  }

  // getMeasurement(): Observable<Measurement[]> {
  //   return of(fakeData, fakeSoilMoisture, fakePhosphorus, fakeNitrogen, fakeHumidity, fakeRoomTemperature).pipe(catchError(this.handleError<Measurement[]>('getMeasurement')))
  // }

  getSoilMoistrue(): Observable<Measurement> {
    return of(fakeSoilMoisture).pipe(catchError(this.handleError<Measurement>('getSoilMoisture')));
  }

  getPhosphorData(): Observable<Measurement> {
    return of(fakePhosphorus).pipe(catchError(this.handleError<Measurement>('getPhosphorData')));
  }

  getNitrogenData(): Observable<Measurement> {
    return of(fakeNitrogen).pipe(catchError(this.handleError<Measurement>('getNitrogenData')));
  }

  getHumidityData(): Observable<Measurement> {
    return of(fakeHumidity).pipe(catchError(this.handleError<Measurement>('getHumidityData')));
  }

  getRoomTemperatureData(): Observable<Measurement> {
    return of(fakeRoomTemperature).pipe(
      catchError(this.handleError<Measurement>('getRoomTemperatureData'))
    );
  }

  private handleError<T>(operation: string) {
    return (error: unknown): Observable<T> => {
      if (error instanceof Error) {
        console.error(`${operation} failed: ${error.message}`);
      } else {
        console.error(`${operation} failed:`, error);
      }
      return throwError(() => error);
    };
  }
}
