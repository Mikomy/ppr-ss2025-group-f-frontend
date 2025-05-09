import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { BackendService } from './backend.service'
import { Measurement } from '../models/measurement.model'
import { Statistics } from '../models/statistics.model'

/**
 * 09.05.2025
 */
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

  it('should fetch dashboard statistics', () => {
    const mockStats: Statistics = {
      overallTotalPointCount: 42,
      averageValues: { foo: 1 },
      latestMeasurements: {
        foo: {
          measurementName: 'foo',
          sensor: { id: '1', name: 's', location: 'l' },
          dataPoints: [],
        },
      },
      measurementPointCount: { foo: 2 },
      minValues: { foo: { timestamp: 't', value: 0 } },
      maxValues: { foo: { timestamp: 't', value: 1 } },
    }

    service.getDashboardStatistics().subscribe((stats) => {
      expect(stats).toEqual(mockStats)
    })

    const req = httpMock.expectOne('http://localhost:8080/api/statistics/dashboard_data')
    expect(req.request.method).toBe('GET')
    req.flush(mockStats)
  })

  it('should handle error and throw for dashboard statistics', () => {
    service.getDashboardStatistics().subscribe({
      next: () => fail('should error'),
      error: (err) => {
        expect(err).toBeTruthy()
      },
    })

    const req = httpMock.expectOne('http://localhost:8080/api/statistics/dashboard_data')
    req.error(new ErrorEvent('Network error'))
  })

  it('should properly handle OpenAI response structure', () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: 'Test Analyse',
          },
        },
      ],
    }

    service.getOpenAiSynopsis('test').subscribe((result) => {
      expect(result).toBe('Test Analyse')
    })

    const req = httpMock.expectOne('https://api.openai.com/v1/chat/completions')
    expect(req.request.method).toBe('POST')
    expect(req.request.headers.get('Content-Type')).toBe('application/json')
    expect(req.request.headers.has('Authorization')).toBeTruthy()

    // Prüfe Request Body
    expect(req.request.body.model).toBe('gpt-4.1-mini')
    expect(req.request.body.temperature).toBe(0.7)
    expect(req.request.body.messages).toBeDefined()
    expect(req.request.body.messages[0].role).toBe('system')
    expect(req.request.body.messages[1].role).toBe('user')
    expect(req.request.body.messages[1].content).toContain('test')

    req.flush(mockResponse)
  })

  it('should handle malformed OpenAI response', () => {
    service.getOpenAiSynopsis('test').subscribe((result) => {
      expect(result).toBe('')
    })

    const req = httpMock.expectOne('https://api.openai.com/v1/chat/completions')
    req.flush({}) // Leere Response
  })
})
