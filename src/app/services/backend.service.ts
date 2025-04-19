import { Injectable } from '@angular/core'
import { Observable, of, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import {
  fakeSoilMoisture,
  fakePhosphorus,
  fakeNitrogen,
  fakeHumidity,
  fakeRoomTemperature,
} from '../models/fake-database/fake-data'
import measurementList from '../assets/sensor-measurements.json'
import { Measurement } from '../models/measurement.model'
import { DropdownOptionModel } from '../models/dropdown.option.model'

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private baseUrl = '/api/influx'
  //constructor(private http: HttpClient) {}

  getDropdownOption(): Observable<DropdownOptionModel[]> {
    return of(measurementList as DropdownOptionModel[])
  }
  // getStatus(): Observable<string> {
  //   return of(fakeData).pipe(catchError(this.handleError<string>('getStatus')))
  // }

  getSoilMoistrue(): Observable<Measurement> {
    return of(fakeSoilMoisture).pipe(catchError(this.handleError<Measurement>('getSoilMoisture')))
  }

  getPhosphorData(): Observable<Measurement> {
    return of(fakePhosphorus).pipe(catchError(this.handleError<Measurement>('getPhosphorData')))
  }

  getNitrogenData(): Observable<Measurement> {
    return of(fakeNitrogen).pipe(catchError(this.handleError<Measurement>('getNitrogenData')))
  }

  getHumidityData(): Observable<Measurement> {
    return of(fakeHumidity).pipe(catchError(this.handleError<Measurement>('getHumidityData')))
  }

  getRoomTemperatureData(): Observable<Measurement> {
    return of(fakeRoomTemperature).pipe(
      catchError(this.handleError<Measurement>('getRoomTemperatureData'))
    )
  }

  getMeasurement(
    measurementName?: string,
    fromTime?: string | undefined,
    toTime?: string | undefined
  ): Observable<Measurement> {
    let url = `${this.baseUrl}/measurements/grouped?measurement=${measurementName}`
    if (fromTime) {
      url += `&from=${encodeURIComponent(fromTime)}`
    }
    if (toTime) {
      url += `&to=${encodeURIComponent(toTime)}`
    }
    return of(fakeRoomTemperature).pipe(
      catchError(this.handleError<Measurement>('getMeasurement' + url))
    )
  }

  private handleError<T>(operation: string) {
    return (error: unknown): Observable<T> => {
      if (error instanceof Error) {
        console.error(`${operation} failed: ${error.message}`)
      } else {
        console.error(`${operation} failed:`, error)
      }
      return throwError(() => error)
    }
  }
}
