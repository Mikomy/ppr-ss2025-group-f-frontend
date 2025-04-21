import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config'
import { AppComponent } from './app/app.component'
import { Chart, registerables } from 'chart.js'
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts'

Chart.register(...registerables)

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') },
    },
  ],
}).catch((err) => console.error(err))
