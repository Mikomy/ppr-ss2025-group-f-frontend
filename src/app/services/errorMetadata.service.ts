import { Injectable, ErrorHandler } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class ErrorMetadataService implements ErrorHandler {
  public handleError(error: unknown): void {
    const date = new Date()
    const safeError = error as { message?: string; zone?: unknown }
    console.error({
      timestamp: date.toISOString(),
      message: safeError?.message,
      zone: safeError?.zone,
    })
  }
}
