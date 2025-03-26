import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ErrorHandler } from '@angular/core'
import { ErrorMetadataService } from './services/errorMetadata.service';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {provide: ErrorHandler, useClass: ErrorMetadataService},
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    provideNativeDateAdapter()
  ]
};
