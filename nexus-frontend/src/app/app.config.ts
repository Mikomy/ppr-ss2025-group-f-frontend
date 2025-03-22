import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ErrorHandler } from '@angular/core'
import { ErrorMetadataService } from './services/error-metadata.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {provide: ErrorHandler, useClass: ErrorMetadataService}
  ]
};
