import { Injectable } from '@angular/core'
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http'
import { Observable, of, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
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

/**
 * 09.05.2025
 * This service handles communication with the backend API to
 * retrieve sensor measurements and related data.
 * It uses Angular's HttpClient to make HTTP requests and
 * provides observables for components to subscribe to.
 */

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  /**
   * Constructor injecting Angular HttpClient.
   * @param http Angular HttpClient for HTTP requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * Base URL for InfluxDB API endpoints.
   */
  private baseUrl = 'http://localhost:8080/api/influx'

  /**
   * Fetch all sensor-grouped data for a given measurement alias.
   * Returns one Measurement[] per sensor.
   * optional time range (fromIso and toIso).
   * @param alias  z.B. 'device_frmpayload_data_nitrogen'
   * @param fromIso          z.B. '2025-04-29T12:12:00.000Z'
   * @param toIso            z.B. '2025-04-29T13:12:00.000Z'
   */
  getGroupedByAlias(alias: string, fromIso?: string, toIso?: string): Observable<Measurement[]> {
    let params = new HttpParams()
    if (fromIso) params = params.set('from', fromIso)
    if (toIso) params = params.set('to', toIso)

    return this.http
      .get<
        Measurement[]
      >(`${this.baseUrl}/measurements/grouped/${encodeURIComponent(alias)}`, { params })
      .pipe(
        catchError((err) => {
          console.error(`Error loading grouped/${alias}`, err)
          return throwError(() => new Error('Fehler beim Laden der Sensordaten.'))
        })
      )
  }

  // http://localhost:8080/sensormodule/measurements/get_statistics
  getStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.baseUrl}/measurements/get_statistics`)
  }

  /**
   * Fetches dashboard statistics from the backend.
   * @returns Observable emitting Statistics object.
   */
  getDashboardStatistics(): Observable<Statistics> {
    return this.http
      .get<Statistics>(`http://localhost:8080/api/statistics/dashboard_data`)
      .pipe(catchError(this.handleError<Statistics>('getStatistics')))
  }

  /**
   * Returns dropdown options for sensor measurements.
   * @returns Observable emitting an array of DropdownOptionModel.
   */
  getDropdownOption(): Observable<DropdownOptionModel[]> {
    return of(measurementList as DropdownOptionModel[])
  }

  /**
   * Fetches sensor measurement data for the specified measurementName and
   * optional time range (fromIso and toIso).
   * @param measurementName  z.B. 'device_frmpayload_data_nitrogen'
   * @param fromIso          z.B. '2025-04-29T12:12:00.000Z'
   * @param toIso            z.B. '2025-04-29T13:12:00.000Z'
   */
  getMeasurement(
    measurementName: string,
    fromIso?: string,
    toIso?: string
  ): Observable<Measurement[]> {
    let params = new HttpParams().set('measurement', measurementName)
    if (fromIso) params = params.set('from', fromIso)
    if (toIso) params = params.set('to', toIso)
    return this.http.get<Measurement[]>(`${this.baseUrl}/measurements/grouped`, { params }).pipe(
      catchError((err) => {
        console.error(err)
        return throwError(() => new Error('Fehler beim Laden der Sensordaten.'))
      })
    )
  }
  /**
   * Calls the OpenAI API to get a synopsis/analysis for the given measurements text.
   * @param measurementsText The measurements as a string to be analyzed.
   * @returns Observable emitting the OpenAI analysis as a string.
   */
  getOpenAiSynopsis(measurementsText: string): Observable<string> {
    const apiKey =
      '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'
    const url = 'https://api.openai.com/v1/chat/completions'
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    })
    const body = {
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content:
            'Du bist ein hilfreicher Assistent für die Analyse von Sensordaten und hilfst Wissenschaftlern, die Daten zu verstehen und zu interpretieren.Dabei erzeugst du einen schön formatierten Text, der die Daten zusammenfasst und analysiert. Du bist in der Lage, auch komplexe Daten zu verstehen und zu interpretieren. Deine Antworten sind präzise und informativ. Der Text sol maximal 150 Wörter lang sein. Du bist in der Lage, auch komplexe Daten zu verstehen und zu interpretieren, du gibst keine reinen Zahlen wider, die sind uninteressant, du interpretierst die Werte sofort! Deine Antworten sind präzise und informativ. Der Text soll maximal 100 Wörter lang sein und mindestens 5 Absätze/Leerzeilen enthalten. Als Abschluss der Analyse erzeugst du das Wort "Handlungssaufforderung" und darunter einen Text mit 50 Wörtern, was aufgrund der Sensordaten zu tun ist.',
        },
        {
          role: 'user',
          content: `Analysiere folgende Messwerte und gib eine kurze Zusammenfassung auf Deutsch:\n${measurementsText}. Die ersten zwei Sätze sollen einen kurzen Überblick verschaffen. Der restliche Text soll nicht die Daten 1:1 wiedergeben, sondern eine Einschätzung zu den Daten liefern.`,
        },
      ],
      temperature: 0.7,
    }
    return this.http.post<unknown>(url, body, { headers }).pipe(
      map((res) => {
        console.log('OpenAI raw response:', res)
        // Typ für OpenAI-Response definieren, um TypeScript-Fehler zu vermeiden
        interface OpenAIResponse {
          choices?: {
            message?: {
              content?:
                | string
                | {
                    content?: string
                  }
            }
          }[]
        }
        const response = res as OpenAIResponse
        if (
          response &&
          Array.isArray(response.choices) &&
          response.choices[0] &&
          response.choices[0].message
        ) {
          const msg = response.choices[0].message
          // content can be a string or an object with a content field
          if (typeof msg.content === 'string') {
            return msg.content
          }
          if (msg.content && typeof (msg.content as { content: string }).content === 'string') {
            return (msg.content as { content: string }).content
          }
        }
        return ''
      }),
      catchError(this.handleError<string>('getOpenAiSynopsis'))
    )
  }

  /**
   * Handles HTTP errors for observable streams.
   * @param operation The name of the operation that failed.
   * @returns A function that returns an observable error.
   */
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
}
