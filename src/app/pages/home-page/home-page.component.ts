import { Component, OnInit, OnDestroy } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { CommonModule } from '@angular/common'
import { BackendService } from '../../services/backend.service'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatDividerModule } from '@angular/material/divider'
import { SensorData } from '../../models/sensorData.model'
import { Statistics } from '../../models/statistics.model'
import { Measurement } from '../../models/measurement.model'

// DEUTSCH Übersetzung ermöglichen
import localeDe from '@angular/common/locales/de'
import { LOCALE_ID } from '@angular/core'
import { registerLocaleData } from '@angular/common'
registerLocaleData(localeDe)
// DEUTSCH Übersetzung ermöglichen

// Typisierung für globale Window Properties
interface NexusWindow extends Window {
  __nexusOpenAiCalled?: boolean
  __nexusOpenAiSynopsis?: string
}

interface MeasurementDisplay {
  name: string
  latestData: SensorData | null
}

interface MeasurementConfig {
  key: string
  label: string
  unit: string
  scaleFactor: number
  icon: string
}

interface SensorGroupOption {
  key: string
  measurementName: string
  alias: string
  sensorName: string
  display: string
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [MatCardModule, CommonModule, MatGridListModule, MatDividerModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }], // Enable German locale
})
export class HomePageComponent implements OnInit, OnDestroy {
  /**
   * Holds the current statistics data for the dashboard.
   */
  statistics: Statistics | undefined

  /**
   * Holds the OpenAI synopsis/analysis text.
   */
  openAiSynopsis: string | undefined

  /**
   * Stores measurements grouped by location.
   */
  measurementsByLocation: Record<string, MeasurementDisplay[]> = {}

  /**
   * Timer ID for the statistics refresh interval.
   */
  private statisticsIntervalId: ReturnType<typeof setInterval> | undefined

  /**
   * Holds the latest error message for statistics loading.
   */
  statisticsError: string | null = null

  /**
   * Global flag in the window object to ensure OpenAI call is only made once per browser session.
   */
  private static get openAiCalledOnce(): boolean {
    return (window as NexusWindow).__nexusOpenAiCalled === true
  }
  private static set openAiCalledOnce(val: boolean) {
    ;(window as NexusWindow).__nexusOpenAiCalled = val
  }

  /**
   * Globally stored OpenAI synopsis (persists across navigation).
   */
  private static get globalOpenAiSynopsis(): string | undefined {
    return (window as NexusWindow).__nexusOpenAiSynopsis
  }
  private static set globalOpenAiSynopsis(val: string | undefined) {
    ;(window as NexusWindow).__nexusOpenAiSynopsis = val
  }

  /**
   * Returns the formatted OpenAI synopsis with line breaks as <br>.
   * @returns {string} The formatted synopsis or a fallback message.
   */
  getFormattedSynopsis(): string {
    return (this.openAiSynopsis || 'Keine KI-Analyse verfügbar').replace(/\n/g, '<br>')
  }

  /**
   * List of measurement configurations for the dashboard.
   */
  measurements: MeasurementConfig[] = [
    {
      key: 'device_frmpayload_data_data_air_temperature_value',
      label: 'Temperatur °C',
      unit: '°C',
      scaleFactor: 4,
      icon: 'temperature-high',
    },
    {
      key: 'device_frmpayload_data_air_humidity_value',
      label: 'Luftfeuchte %',
      unit: '%',
      scaleFactor: 2,
      icon: 'tint',
    },
    {
      key: 'device_frmpayload_data_data_Humidity',
      label: 'Luftfeuchte 2 %',
      unit: '%',
      scaleFactor: 2,
      icon: 'tint',
    },
    {
      key: 'device_frmpayload_data_co2_concentration_value',
      label: 'CO₂ ppm',
      unit: 'ppm',
      scaleFactor: 0.125, // 1/8
      icon: 'cloud',
    },
    {
      key: 'device_frmpayload_data_phosphorus',
      label: 'Phosphor',
      unit: '',
      scaleFactor: 0.02,
      icon: 'flask',
    },
    {
      key: 'device_frmpayload_data_nitrogen',
      label: 'Stickstoff',
      unit: '',
      scaleFactor: 0.1,
      icon: 'flask',
    },
    {
      key: 'device_frmpayload_data_potassium',
      label: 'Kalium',
      unit: '',
      scaleFactor: 0.02,
      icon: 'flask',
    },
    {
      key: 'device_frmpayload_data_data_SoilMoisture',
      label: 'Bodenfeuchtigkeit %',
      unit: '%',
      scaleFactor: 2,
      icon: 'water',
    },
  ]

  /**
   * Holds the latest measurement data.
   */
  latestMeasurement: Measurement | null = null

  /**
   * Holds the dropdown options for sensor groups.
   */
  sensorListForFiltering: SensorGroupOption[] = []

  /**
   * Holds the currently selected sensor group key.
   */
  selectedSensorGroupKey: string | null = null

  /**
   * Constructor injecting the backend service.
   * @param backendService The backend service for API calls.
   */
  constructor(private backendService: BackendService) {}

  /**
   * Angular lifecycle hook: Called after component initialization.
   * Loads statistics and triggers OpenAI analysis only once per session.
   */
  ngOnInit(): void {
    this.loadStatistics()

    // Load OpenAI synopsis from global storage (persists across navigation)
    this.openAiSynopsis = HomePageComponent.globalOpenAiSynopsis

    // Only call OpenAI once per browser session
    if (!HomePageComponent.openAiCalledOnce) {
      HomePageComponent.openAiCalledOnce = true
      this.loadOpenAiSynopsis()
    }

    this.statisticsIntervalId = setInterval(() => {
      this.loadStatistics()
    }, 3000)
    console.table(this.statistics)
    console.log('Statistics:', this.statistics)

    this.backendService.getDropdownOption().subscribe((opts) => {
      this.sensorListForFiltering = opts.map((o, i) => ({
        key: i.toString(),
        sensorName: o.sensor.name,
        measurementName: o.measurementName,
        alias: o.alias!,
        display: `${o.measurementName} – ${o.sensor.name}`,
      }))

      // if (this.sensorGroupOptions.length > 0 && !this.selectedSensorGroupKey) {
      //   this.selectedSensorGroupKey = this.sensorGroupOptions[0].key
      // }
    })
  }

  /**
   * Angular lifecycle hook: Called when the component is destroyed.
   * Clears the statistics refresh interval.
   */
  ngOnDestroy(): void {
    if (this.statisticsIntervalId) {
      clearInterval(this.statisticsIntervalId)
    }
  }

  /**
   * Loads dashboard statistics from the backend and updates the component state.
   * Handles errors and sets the error message if loading fails.
   */
  loadStatistics() {
    this.backendService.getDashboardStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats
        this.statisticsError = null
        this.latestMeasurement = this.getLatestMeasurement()
      },
      error: (error) => {
        const errMsg = error instanceof Error ? error.message : String(error)
        this.statisticsError = 'Fehler beim Laden der Daten: ' + errMsg
        this.statistics = undefined
      },
    })
  }

  /**
   * Loads the OpenAI synopsis by fetching statistics and sending them to the OpenAI endpoint.
   * Stores the result globally so it persists across navigation.
   */
  private loadOpenAiSynopsis() {
    // Fetch initial statistics for AI analysis
    this.backendService.getDashboardStatistics().subscribe({
      next: (stats) => {
        this.backendService.getOpenAiSynopsis(JSON.stringify(stats)).subscribe({
          next: (aiSynopsis) => {
            this.openAiSynopsis = aiSynopsis
            HomePageComponent.globalOpenAiSynopsis = aiSynopsis // store globally
          },
          error: (error) => {
            const errMsg = error instanceof Error ? error.message : String(error)
            this.openAiSynopsis = 'Fehler bei der KI-Analyse: ' + errMsg
            HomePageComponent.globalOpenAiSynopsis = this.openAiSynopsis
          },
        })
      },
      error: (error) => {
        const errMsg = error instanceof Error ? error.message : String(error)
        this.openAiSynopsis = 'Fehler beim Laden der Statistik für KI-Analyse: ' + errMsg
        HomePageComponent.globalOpenAiSynopsis = this.openAiSynopsis
      },
    })
  } // end loadOpenAiSynopsis()

  /**
   * Gibt das Measurement-Objekt mit dem jüngsten Timestamp aus statistics.latestMeasurements zurück.
   * @returns Das Measurement-Objekt mit dem neuesten Timestamp oder null.
   */
  private getLatestMeasurement(): Measurement | null {
    if (!this.statistics || !this.statistics.latestMeasurements) {
      return null
    }
    let latest: Measurement | null = null
    let latestTimestamp = 0
    for (const key in this.statistics.latestMeasurements) {
      const measurement = this.statistics.latestMeasurements[key]
      if (measurement.dataPoints && measurement.dataPoints.length > 0) {
        const ts = new Date(measurement.dataPoints[0].timestamp).getTime()
        if (ts > latestTimestamp) {
          latestTimestamp = ts
          latest = measurement
        }
      }
    }
    return latest
  }

  /**
   * Handles changes in the sensor group dropdown.
   * @param event The change event from the dropdown.
   */
  onSensorGroupChange(event: Event) {
    const select = event.target as HTMLSelectElement
    this.selectedSensorGroupKey = select.value
    // Hier ggf. weitere Logik, z.B. Filterung der Daten nach Auswahl
  }
}
