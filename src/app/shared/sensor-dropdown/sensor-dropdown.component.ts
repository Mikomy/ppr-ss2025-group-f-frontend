import { Component, EventEmitter, OnInit, Output } from '@angular/core'
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
export class SensorDropdownComponent implements OnInit {
  sensorControl = new FormControl<DropdownOptionModel | string | null>(null)
  dropdownOptions: DropdownOptionModel[] = []
  filteredOptions: Observable<DropdownOptionModel[]> = of([])
  currentState: 'loading' | 'error' | 'complete' = 'loading'

  @Output() selectionChange = new EventEmitter<DropdownOptionModel>()

  constructor(private backendService: BackendService) {}

  ngOnInit(): void {
    this.backendService.getDropdownOption().subscribe({
      next: (options) => {
        this.dropdownOptions = options
        this.currentState = 'complete'
        this.filteredOptions = this.sensorControl.valueChanges.pipe(
          startWith<string | DropdownOptionModel | null>(null),
          map((value) => {
            const filterValue =
              typeof value === 'string'
                ? value.toLowerCase()
                : value && typeof value === 'object'
                  ? value.measurementName.toLowerCase()
                  : ''
            return this.dropdownOptions.filter(
              (option) =>
                option.measurementName.toLowerCase().includes(filterValue) ||
                option.sensor.name.toLowerCase().includes(filterValue)
            )
          })
        )
      },
      error: (err) => {
        console.error('Failed loading dropdown options', err)
        this.currentState = 'error'
      },
    })
  }

  displayFn = (option: DropdownOptionModel | string | null): string =>
    typeof option === 'object' && option ? option.measurementName : (option as string) || ''

  onOptionSelected(option: DropdownOptionModel): void {
    this.selectionChange.emit(option)
  }
}
