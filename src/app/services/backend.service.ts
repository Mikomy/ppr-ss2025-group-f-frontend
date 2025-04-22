import { Injectable } from '@angular/core'
import { Observable, of, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'
import {
  fakeAirHumidity,
  fakeAirTemperature,
  fakeCO2Concentration,
  fakeSoilMoisture,
  fakeNitrogen,
  fakePhosphorus,
  fakePotassium,
  fakeDataHumidity,
  fakeDataSoilMoisture,
  fakeDataTemperature,
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
  //   return of([]).pipe(catchError(this.handleError<string>('getStatus')))
  // }
  //
  // getSoilMoistrue(): Observable<Measurement[]> {
  //   return of([]).pipe(catchError(this.handleError<Measurement>('getSoilMoisture')))
  // }
  //
  // getPhosphorData(): Observable<Measurement[]> {
  //   return of([]).pipe(catchError(this.handleError<Measurement>('getPhosphorData')))
  // }
  //
  // getNitrogenData(): Observable<Measurement[]> {
  //   return of([]).pipe(catchError(this.handleError<Measurement>('getNitrogenData')))
  // }
  //
  // getHumidityData(): Observable<Measurement[]> {
  //   return of([]).pipe(catchError(this.handleError<Measurement>('getHumidityData')))
  // }
  //
  // getRoomTemperatureData(): Observable<Measurement[]> {
  //   return of([]).pipe(
  //     catchError(this.handleError<Measurement>('getRoomTemperatureData'))
  //   )
  // }
  // //Only for testing noData available
  // getMeasurement(
  //   measurementName?: string,
  //   fromTime?: string,
  //   toTime?: string
  // ): Observable<Measurement[]> {
  //       return of([])
  //   }

  getMeasurement(
    measurementName?: string,
    fromTime?: string,
    toTime?: string
  ): Observable<Measurement[]> {
    switch (measurementName) {
      case 'device_frmpayload_data_air_humidity_value':
        return of(fakeAirHumidity)
      case 'device_frmpayload_data_air_temperature_value':
        return of(fakeAirTemperature)
      case 'device_frmpayload_data_co2_concentration_value':
        return of(fakeCO2Concentration)
      case 'device_frmpayload_data_soil_moisture':
        return of(fakeSoilMoisture)
      case 'device_frmpayload_data_nitrogen':
        return of(fakeNitrogen)
      case 'device_frmpayload_data_phosphorus':
        return of(fakePhosphorus)
      case 'device_frmpayload_data_potassium':
        return of(fakePotassium)
      case 'device_frmpayload_data_data_Humidity':
        return of(fakeDataHumidity)
      case 'device_frmpayload_data_data_SoilMoisture':
        return of(fakeDataSoilMoisture)
      case 'device_frmpayload_data_data_Temperature':
        return of(fakeDataTemperature)
      default:
        // kein passendes Measurement → leeres Array
        return of([]).pipe(catchError(this.handleError<Measurement[]>(`${fromTime},${toTime}`)))
    }
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
