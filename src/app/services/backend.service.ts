import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable, of, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
// import {
//   fakeAirHumidity,
//   fakeAirTemperature,
//   fakeCO2Concentration,
//   fakeSoilMoisture,
//   fakeNitrogen,
//   fakePhosphorus,
//   fakePotassium,
//   fakeDataHumidity,
//   fakeDataSoilMoisture,
//   fakeDataTemperature,
// } from '../models/fake-database/fake-data'
import measurementList from '../assets/sensor-measurements.json'
import { Measurement } from '../models/measurement.model'
import { DropdownOptionModel } from '../models/dropdown.option.model'
import { Statistics } from '../models/statistics.model'

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(private http: HttpClient) {}

  private baseUrl = 'http://localhost:8080/api/influx'

  // http://localhost:8080/sensormodule/measurements/get_statistics
  getStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.baseUrl}/measurements/get_statistics`)
  }

  getDropdownOption(): Observable<DropdownOptionModel[]> {
    return of(measurementList as DropdownOptionModel[])
  }

  getMeasurement(
    measurementName: string,
    fromTime?: string,
    toTime?: string
  ): Observable<Measurement[]> {
    let params = new HttpParams().set('measurement', measurementName)
    if (fromTime) {
      params = params.set('from', fromTime)
    }
    if (toTime) {
      params = params.set('to', toTime)
    }
    return this.http.get<Measurement[]>(`${this.baseUrl}/measurements/grouped`, { params }).pipe(
      catchError((error) => {
        console.error(
          `Error fetching measurement '${measurementName}' with interval [${fromTime},${toTime}]:`,
          error
        )
        return throwError(() => new Error('Fehler beim Laden der Sensordaten vom Server.'))
      })
    )
  }

  // getMeasurement(
  //   measurementName?: string,
  //   fromTime?: string,
  //   toTime?: string
  // ): Observable<Measurement[]> {
  //   switch (measurementName) {
  //     case 'SCRUM24-TC02-AC01: Negativer Test':
  //       return of([])
  //     case 'device_frmpayload_data_air_humidity_value':
  //       return of(fakeAirHumidity)
  //     case 'device_frmpayload_data_air_temperature_value':
  //       return of(fakeAirTemperature)
  //     case 'device_frmpayload_data_co2_concentration_value':
  //       return of(fakeCO2Concentration)
  //     case 'device_frmpayload_data_soil_moisture':
  //       return of(fakeSoilMoisture)
  //     case 'device_frmpayload_data_nitrogen':
  //       return of(fakeNitrogen)
  //     case 'device_frmpayload_data_phosphorus':
  //       return of(fakePhosphorus)
  //     case 'device_frmpayload_data_potassium':
  //       return of(fakePotassium)
  //     case 'device_frmpayload_data_data_Humidity':
  //       return of(fakeDataHumidity)
  //     case 'device_frmpayload_data_data_SoilMoisture':
  //       return of(fakeDataSoilMoisture)
  //     case 'device_frmpayload_data_data_Temperature':
  //       return of(fakeDataTemperature)
  //     default:
  //       // kein passendes Measurement → leeres Array
  //       return of([]).pipe(catchError(this.handleError<Measurement[]>(`${fromTime},${toTime}`)))
  //   }
  // }

  // private handleError<T>(operation: string) {
  //   return (error: unknown): Observable<T> => {
  //     if (error instanceof Error) {
  //       console.error(`${operation} failed: ${error.message}`)
  //     } else {
  //       console.error(`${operation} failed:`, error)
  //     }
  //     return throwError(() => error)
  //   }
  // }
}
