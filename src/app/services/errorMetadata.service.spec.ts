import { TestBed } from '@angular/core/testing'

import { ErrorMetadataService } from './errorMetadata.service'

describe('ErrorMetadataService', () => {
  let service: ErrorMetadataService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(ErrorMetadataService)
    spyOn(globalThis.console, 'error')
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should log a structured error when a normal error object is passed', () => {
    const fakeError = {
      message: 'Something went wrong!',
      zone: 'ZoneA',
    }

    service.handleError(fakeError)

    expect(console.error).toHaveBeenCalledWith(
      jasmine.objectContaining({
        timestamp: jasmine.anything(),
        message: 'Something went wrong!',
        zone: 'ZoneA',
      })
    )
  })

  it('should log undefined message and zone when missing', () => {
    const fakeError = {} // missing message and zone

    service.handleError(fakeError)

    expect(console.error).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: undefined,
        zone: undefined,
      })
    )
  })

  it('should handle primitive error inputs gracefully', () => {
    const primitiveError = 'a string error'

    expect(() => service.handleError(primitiveError)).not.toThrow()

    expect(console.error).toHaveBeenCalledWith(
      jasmine.objectContaining({
        message: undefined,
        zone: undefined,
      })
    )
  })

  it('should handle null or undefined errors gracefully', () => {
    expect(() => service.handleError(null)).not.toThrow()
    expect(() => service.handleError(undefined)).not.toThrow()
  })
})
