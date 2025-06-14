import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatOptionModule } from '@angular/material/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { BackendService } from '../../services/backend.service'
import { DropdownOptionModel } from '../../models/dropdown.option.model'

@Component({
  selector: 'app-sensor-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sensor-dropdown.component.html',
  styleUrls: ['./sensor-dropdown.component.scss'],
})
export class SensorDropdownComponent implements OnInit, OnChanges {
  sensorControl = new FormControl<DropdownOptionModel | string | null>(null)
  dropdownOptions: DropdownOptionModel[] = []
  filteredOptions: Observable<DropdownOptionModel[]> = of([])
  currentState: 'loading' | 'error' | 'complete' = 'loading'
  @Input() selectedOption?: DropdownOptionModel
  @Output() selectionChange = new EventEmitter<DropdownOptionModel>()

  constructor(private backendService: BackendService) {}

  ngOnInit(): void {
    this.backendService.getDropdownOption().subscribe({
      next: (options) => {
        this.dropdownOptions = options
        this.currentState = 'complete'
        this.filteredOptions = this.sensorControl.valueChanges.pipe(
          // startWith: zuerst mit dem aktuellen Wert starten
          startWith<DropdownOptionModel | string | null>(this.selectedOption ?? null),
          map((value) => {
            if (value && typeof value === 'object' && 'measurementName' in value) {
              return this.dropdownOptions.slice()
            }
            const filterValue = typeof value === 'string' ? value.toLowerCase() : ''
            return this.dropdownOptions.filter(
              (option) =>
                option.measurementName.toLowerCase().includes(filterValue) ||
                option.sensor.name.toLowerCase().includes(filterValue)
            )
          })
        )
      },
      error: () => (this.currentState = 'error'),
    })
  }

  /**
   * Display function for the Autocomplete input.
   * Returns "measurementName – sensor.name" when an object is selected.
   *
   * @param option  The selected DropdownOptionModel or a raw string
   * @returns The string that should appear in the input box
   */
  displayFn = (option: DropdownOptionModel | string | null): string =>
    typeof option === 'object' && option
      ? `${option.measurementName} – ${option.sensor.name}`
      : (option as string) || ''

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedOption'] && this.selectedOption) {
      this.sensorControl.setValue(this.selectedOption)
    }
  }
  onOptionSelected(option: DropdownOptionModel): void {
    this.sensorControl.setValue(option)
    this.selectionChange.emit(option)
  }
}
