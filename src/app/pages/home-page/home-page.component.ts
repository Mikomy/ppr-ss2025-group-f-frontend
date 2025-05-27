import { Component, OnInit, OnDestroy } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { CommonModule } from '@angular/common'
import { BackendService } from '../../services/backend.service'
import { MatGridListModule } from '@angular/material/grid-list'
import { MatDividerModule } from '@angular/material/divider'
import { SensorData } from '../../models/sensorData.model'
import { Statistics } from '../../models/statistics.model'
import { Measurement } from '../../models/measurement.model'
import { Router, ActivatedRoute } from '@angular/router' // Add this import
import { FormsModule } from '@angular/forms' // Add this import

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
  imports: [
    MatCardModule,
    CommonModule,
    MatGridListModule,
    MatDividerModule,
    FormsModule, // Add FormsModule to imports
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }], // Enable German locale
})
export class HomePageComponent implements OnInit, OnDestroy {
  statistics: Statistics | undefined
  openAiSynopsis: string | undefined
  measurementsByLocation: Record<string, MeasurementDisplay[]> = {}
  private statisticsIntervalId: ReturnType<typeof setInterval> | undefined
  statisticsError: string | null = null
  isSynopsisLoading = false

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
    if (this.isSynopsisLoading) {
      return 'Lade neue Synopsis...'
    }
    return (this.openAiSynopsis || 'Keine KI-Analyse verfügbar').replace(/\n/g, '<br>')
  }

  // Base measurement configurations
  private baseMeasurements: MeasurementConfig[] = [
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
      label: 'Bodenfeuchte 2 - %',
      unit: '%',
      scaleFactor: 2,
      icon: 'water',
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

  // Additional measurements to show when filtered
  private additionalMeasurements: MeasurementConfig[] = [
    {
      key: 'device_frmpayload_data_soil_moisture',
      label: 'Bodenfeuchtigkeit (Milesight) %',
      unit: '%',
      scaleFactor: 2,
      icon: 'water',
    },
    {
      key: 'device_frmpayload_data_data_Temperature',
      label: 'Temperatur (Senzemo) °C',
      unit: '°C',
      scaleFactor: 4,
      icon: 'temperature-high',
    },
    {
      key: 'device_frmpayload_data_air_temperature_value',
      label: 'Temperatur (Decentlab) °C',
      unit: '°C',
      scaleFactor: 4,
      icon: 'temperature-high',
    },
  ]

  // Current measurements based on filter state
  measurements: MeasurementConfig[] = []

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
   * Add new property to track active filter
   */
  public activeFilter: { sensorName: string; measurementName: string } | null = null

  /**
   * Constructor injecting the backend service.
   * @param backendService The backend service for API calls.
   */
  constructor(
    private backendService: BackendService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Angular lifecycle hook: Called after component initialization.
   * Loads statistics and triggers OpenAI analysis only once per session.
   */
  ngOnInit(): void {
    // Check URL parameters first
    this.route.queryParams.subscribe((params) => {
      if (params['sensorName'] && params['measurementName']) {
        // Load dropdown options first
        this.backendService.getDropdownOption().subscribe((opts) => {
          this.sensorListForFiltering = opts.map((o, i) => ({
            key: i.toString(),
            sensorName: o.sensor.name,
            measurementName: o.measurementName,
            alias: o.alias!,
            display: `${o.measurementName} – ${o.sensor.name}`,
          }))

          // Find matching sensor in dropdown options
          const matchingSensor = this.sensorListForFiltering.find(
            (s) =>
              s.sensorName === params['sensorName'] &&
              s.measurementName === params['measurementName']
          )

          if (matchingSensor) {
            // Set selected key and active filter
            this.selectedSensorGroupKey = matchingSensor.key
            this.activeFilter = {
              sensorName: params['sensorName'],
              measurementName: params['measurementName'],
            }

            // Load filtered statistics and trigger OpenAI
            this.loadFilteredStatistics()
            this.loadOpenAiSynopsis()
          } else {
            this.loadStatistics()
            this.loadOpenAiSynopsis()
          }
        })
      } else {
        // No URL parameters, load normal statistics and OpenAI
        this.loadStatistics()
        this.loadOpenAiSynopsis()
        this.backendService.getDropdownOption().subscribe((opts) => {
          this.sensorListForFiltering = opts.map((o, i) => ({
            key: i.toString(),
            sensorName: o.sensor.name,
            measurementName: o.measurementName,
            alias: o.alias!,
            display: `${o.measurementName} – ${o.sensor.name}`,
          }))
        })
      }
    })

    // Load OpenAI synopsis from global storage (persists across navigation)
    this.openAiSynopsis = HomePageComponent.globalOpenAiSynopsis

    // Set up refresh interval
    this.statisticsIntervalId = setInterval(() => {
      if (this.activeFilter) {
        this.loadFilteredStatistics()
      } else {
        this.loadStatistics()
      }
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

    // Initialize measurements
    this.measurements = [...this.baseMeasurements]
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
   * Loads dashboard statistics from the backend and updates the component state.
   * Handles errors and sets the error message if loading fails.
   */
  loadFilteredStatistics() {
    if (!this.selectedSensorGroupKey) {
      return
    }

    const selectedSensor = this.sensorListForFiltering.find(
      (s) => s.key === this.selectedSensorGroupKey
    )

    if (selectedSensor) {
      this.backendService
        .getFilteredDashboardStatistics(selectedSensor.sensorName, selectedSensor.measurementName)
        .subscribe({
          next: (stats) => {
            this.statistics = stats
            this.statisticsError = null
            this.latestMeasurement = this.getLatestMeasurement()
          },
          error: (error) => {
            const errMsg = error instanceof Error ? error.message : String(error)
            this.statisticsError = 'Fehler beim Laden der gefilterten Daten: ' + errMsg
            this.statistics = undefined
          },
        })
    }
  }

  /**
   * Loads the OpenAI synopsis by fetching statistics and sending them to the OpenAI endpoint.
   * Stores the result globally so it persists across navigation.
   */
  private loadOpenAiSynopsis() {
    this.isSynopsisLoading = true

    // Function to handle OpenAI response
    const handleOpenAiResponse = (aiSynopsis: string) => {
      this.openAiSynopsis = aiSynopsis
      HomePageComponent.globalOpenAiSynopsis = aiSynopsis
      this.isSynopsisLoading = false
    }

    // Function to handle errors
    const handleError = (error: unknown) => {
      const errMsg = error instanceof Error ? error.message : String(error)
      this.openAiSynopsis = 'Fehler bei der KI-Analyse: ' + errMsg
      HomePageComponent.globalOpenAiSynopsis = this.openAiSynopsis
      this.isSynopsisLoading = false
    }

    // Get appropriate statistics based on filter state
    const statsObservable =
      this.activeFilter && this.selectedSensorGroupKey
        ? this.backendService.getFilteredDashboardStatistics(
            this.activeFilter.sensorName,
            this.activeFilter.measurementName
          )
        : this.backendService.getDashboardStatistics()

    // Process statistics and get OpenAI analysis
    statsObservable.subscribe({
      next: (stats) => {
        this.backendService.getOpenAiSynopsis(JSON.stringify(stats)).subscribe({
          next: handleOpenAiResponse,
          error: handleError,
        })
      },
      error: handleError,
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

    const selectedSensor = this.sensorListForFiltering.find((s) => s.key === select.value)

    if (selectedSensor) {
      // Set active filter
      this.activeFilter = {
        sensorName: selectedSensor.sensorName,
        measurementName: selectedSensor.measurementName,
      }

      // Update measurements
      this.updateMeasurements()

      // Update URL parameters
      this.router.navigate([], {
        queryParams: {
          sensorName: selectedSensor.sensorName,
          measurementName: selectedSensor.measurementName,
        },
        queryParamsHandling: 'merge',
      })

      // Load filtered statistics
      this.backendService
        .getFilteredDashboardStatistics(selectedSensor.sensorName, selectedSensor.measurementName)
        .subscribe({
          next: (stats) => {
            this.statistics = stats
            this.statisticsError = null
            this.latestMeasurement = this.getLatestMeasurement()
            // Trigger OpenAI analysis with new data
            this.loadOpenAiSynopsis()
          },
          error: (error) => {
            const errMsg = error instanceof Error ? error.message : String(error)
            this.statisticsError = 'Fehler beim Laden der gefilterten Daten: ' + errMsg
            this.statistics = undefined
          },
        })
    } else {
      // Clear active filter
      this.activeFilter = null

      // Update measurements
      this.updateMeasurements()

      this.loadStatistics()
      // Trigger OpenAI analysis for unfiltered data
      this.loadOpenAiSynopsis()
    }
  }

  /**
   * Resets the filter and loads unfiltered statistics
   */
  resetFilter(): void {
    // Clear filter state
    this.activeFilter = null
    this.selectedSensorGroupKey = null

    // Remove URL parameters
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true, // Replace URL instead of adding to history
    })

    // Load unfiltered statistics
    this.loadStatistics()

    // Update measurements
    this.updateMeasurements()
  }

  /**
   * Gets the first available average value from statistics
   * @returns The first average value or undefined
   */
  getSensorNameFromJsonResponse(): { key: string; value: number } | undefined {
    if (!this.statistics?.averageValues) return undefined
    const entries = Object.entries(this.statistics.averageValues)
    return entries.length > 0 ? { key: entries[0][0], value: entries[0][1] } : undefined
  }

  /**
   * Gets the label for the current filtered measurement
   */
  getCurrentMeasurementLabel(): string | undefined {
    if (!this.statistics?.averageValues) return undefined
    const firstKey = Object.keys(this.statistics.averageValues)[0]
    return this.measurements.find((m) => m.key === firstKey)?.label
  }

  // Update measurements based on filter status
  private updateMeasurements(): void {
    if (this.activeFilter) {
      // Show all measurements when filtered
      this.measurements = [...this.baseMeasurements, ...this.additionalMeasurements]
    } else {
      // Show only base measurements when not filtered
      this.measurements = [...this.baseMeasurements]
    }
  }
}
