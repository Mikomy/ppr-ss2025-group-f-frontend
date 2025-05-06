import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { BackendService } from './backend.service'
import { Measurement } from '../models/measurement.model'

describe('BackendService - getMeasurement', () => {
  let service: BackendService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BackendService],
    })
    service = TestBed.inject(BackendService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify() // Stellt sicher, dass keine unerwarteten Anfragen ausstehen
  })

  it('should fetch measurements with all parameters correctly', () => {
    const measurementName = 'device_frmpayload_data_air_humidity_value'
    const fromIso = '2025-04-29T12:00:00.000Z'
    const toIso = '2025-04-29T13:00:00.000Z'
    const mockResponse: Measurement[] = [
      {
        measurementName: 'device_frmpayload_data_air_humidity_value',
        sensor: { name: 'Sensor1', id: 's1', location: 'L1' },
        dataPoints: [{ timestamp: '2025-04-29T12:00:00Z', value: 50 }],
      },
    ]

    service.getMeasurement(measurementName, fromIso, toIso).subscribe((data) => {
      expect(data).toEqual(mockResponse)
    })

    const req = httpMock.expectOne(
      (request) =>
        request.url === 'http://localhost:8080/api/influx/measurements/grouped' &&
        request.params.get('measurement') === measurementName &&
        request.params.get('from') === fromIso &&
        request.params.get('to') === toIso
    )
    expect(req.request.method).toBe('GET')
    req.flush(mockResponse)
  })

  it('should fetch measurements without optional parameters', () => {
    const measurementName = 'device_frmpayload_data_air_humidity_value'
    const mockResponse: Measurement[] = [
      {
        measurementName: 'device_frmpayload_data_air_humidity_value',
        sensor: { name: 'Sensor1', id: 's1', location: 'L1' },
        dataPoints: [{ timestamp: '2025-04-29T12:00:00Z', value: 50 }],
      },
    ]

    service.getMeasurement(measurementName).subscribe((data) => {
      expect(data).toEqual(mockResponse)
    })

    const req = httpMock.expectOne(
      (request) =>
        request.url === 'http://localhost:8080/api/influx/measurements/grouped' &&
        request.params.get('measurement') === measurementName &&
        !request.params.has('from') &&
        !request.params.has('to')
    )
    expect(req.request.method).toBe('GET')
    req.flush(mockResponse)
  })

  it('should handle HTTP errors gracefully', () => {
    const measurementName = 'device_frmpayload_data_air_humidity_value'
    const errorMessage = 'Fehler beim Laden der Sensordaten.'

    service.getMeasurement(measurementName).subscribe({
      next: () => fail('Expected an error, not a successful response'),
      error: (error) => {
        expect(error.message).toBe(errorMessage)
      },
    })

    const req = httpMock.expectOne(
      (request) =>
        request.url === 'http://localhost:8080/api/influx/measurements/grouped' &&
        request.params.get('measurement') === measurementName
    )
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' })
  })
})
