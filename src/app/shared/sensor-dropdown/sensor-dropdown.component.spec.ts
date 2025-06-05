import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { SensorDropdownComponent } from './sensor-dropdown.component'
import { BackendService } from '../../services/backend.service'
import { DropdownOptionModel } from '../../models/dropdown.option.model'
import { of, skip, throwError } from 'rxjs'
import { ReactiveFormsModule } from '@angular/forms'

describe('SensorDropdownComponent', () => {
  let component: SensorDropdownComponent
  let fixture: ComponentFixture<SensorDropdownComponent>
  let backendService: jasmine.SpyObj<BackendService>

  const mockOptions: DropdownOptionModel[] = [
    {
      measurementName: 'Soil Moisture',
      sensor: { id: '1', name: 'Sensor A', location: 'Nexus' },
      alias: 'Soil Moisture',
    },
    {
      measurementName: 'Air Temp',
      sensor: { id: '2', name: 'Sensor B', location: 'Nexua' },
      alias: 'Air Temp',
    },
  ]

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('BackendService', ['getDropdownOption'])

    await TestBed.configureTestingModule({
      imports: [SensorDropdownComponent, ReactiveFormsModule],
      providers: [{ provide: BackendService, useValue: spy }],
    }).compileComponents()

    backendService = TestBed.inject(BackendService) as jasmine.SpyObj<BackendService>
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorDropdownComponent)
    component = fixture.componentInstance
  })

  it('should create component', () => {
    expect(component).toBeTruthy()
  })

  it('should load dropdown options on init (success)', fakeAsync(() => {
    backendService.getDropdownOption.and.returnValue(of(mockOptions))

    fixture.detectChanges() // triggers ngOnInit
    tick()

    expect(component.dropdownOptions.length).toBe(2)
    expect(component.currentState).toBe('complete')
  }))

  it('should set error state when loading fails', fakeAsync(() => {
    backendService.getDropdownOption.and.returnValue(throwError(() => new Error('Error')))

    fixture.detectChanges()
    tick()

    expect(component.currentState).toBe('error')
  }))

  it('should filter dropdown options by measurement name', (done) => {
    // 1. Backend mocken
    backendService.getDropdownOption.and.returnValue(of(mockOptions))

    // 2. Komponente initialisieren
    fixture.detectChanges() // löst ngOnInit aus und setzt filteredOptions

    // 3. Erst abonnieren, dann den Filterbegriff setzen
    component.filteredOptions
      .pipe(skip(1)) // überspringt das erste startWith(null)
      .subscribe((filtered) => {
        expect(filtered.length).toBe(1)
        expect(filtered[0].measurementName).toBe('Air Temp')
        done() // Test beenden
      })

    // 4. Filterbegriff triggern
    component.sensorControl.setValue('Air')
  })

  it('should emit selectionChange on option selection', () => {
    spyOn(component.selectionChange, 'emit')

    const selectedOption = mockOptions[0]
    component.onOptionSelected(selectedOption)

    expect(component.selectionChange.emit).toHaveBeenCalledWith(selectedOption)
  })

  it('displayFn should return measurement name if option is object', () => {
    const option = mockOptions[0]
    expect(component.displayFn(option)).toBe('Soil Moisture – Sensor A')
  })

  it('displayFn should return string if option is string', () => {
    expect(component.displayFn('Test')).toBe('Test')
  })

  it('displayFn should return empty string if option is null', () => {
    expect(component.displayFn(null)).toBe('')
  })
})
