import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { DateTimePickerComponent, DateTimeRange } from './date-time-picker.component'

describe('DateTimePickerComponent', () => {
  let component: DateTimePickerComponent
  let fixture: ComponentFixture<DateTimePickerComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, DateTimePickerComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(DateTimePickerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create component and formGroup', () => {
    expect(component).toBeTruthy()
    expect(component.rangeForm).toBeDefined()
  })

  it('combine should merge date and time correctly', () => {
    const date = new Date(2025, 4, 13)
    interface Combiner {
      combine(date: Date, time: string): Date
    }
    const combiner = component as unknown as Combiner
    const result = combiner.combine(date, '08:30')
    expect(result.getHours()).toBe(8)
    expect(result.getMinutes()).toBe(30)
  })

  it('writeValue should update form values without emitting events', fakeAsync(() => {
    const spy = jasmine.createSpy('onChange')
    component.registerOnChange(spy)
    const range: DateTimeRange = {
      fromDate: new Date(2025, 1, 1),
      fromTime: '09:00',
      toDate: new Date(2025, 1, 2),
      toTime: '18:00',
    }
    component.writeValue(range)
    tick()
    expect(component.rangeForm.value).toEqual(range)
    expect(spy).not.toHaveBeenCalled()
  }))

  it('setDisabledState should enable and disable form', () => {
    component.setDisabledState(true)
    expect(component.rangeForm.disabled).toBeTrue()
    component.setDisabledState(false)
    expect(component.rangeForm.enabled).toBeTrue()
  })

  // ────────────────────────────────────────────────────────────────────────────────
  // Validation tests
  // ────────────────────────────────────────────────────────────────────────────────

  function triggerValidation() {
    // mark dirty and re-run validators
    component.rangeForm.markAsDirty()
    component.rangeForm.updateValueAndValidity({ onlySelf: true, emitEvent: false })
  }

  it('validate should return required error if any field is missing', () => {
    component.rangeForm.setValue({
      fromDate: null,
      fromTime: null,
      toDate: null,
      toTime: null,
    })
    triggerValidation()
    const errors = component.validate()
    expect(errors).toEqual({ required: true })
  })

  it('validate should return rangeInvalid if "from" is after "to"', () => {
    const later = new Date(2025, 0, 2, 12, 0)
    const earlier = new Date(2025, 0, 1, 12, 0)
    component.rangeForm.setValue({
      fromDate: later,
      fromTime: '12:00',
      toDate: earlier,
      toTime: '12:00',
    })
    triggerValidation()
    const errors = component.validate()
    expect(errors).toEqual({ rangeInvalid: true })
  })

  it('validate should return dateTooEarly if "from" is before minDate', () => {
    const tooEarly = new Date(2024, 11, 31, 10, 0) // before Jan 1, 2025
    const validLater = new Date(2025, 0, 2, 10, 0)
    component.rangeForm.setValue({
      fromDate: tooEarly,
      fromTime: '10:00',
      toDate: validLater,
      toTime: '10:00',
    })
    triggerValidation()
    const errors = component.validate()
    expect(errors).toEqual({ dateTooEarly: true })
  })

  it('validate should return null for a fully valid range', () => {
    const validStart = new Date(2025, 0, 1, 8, 0)
    const validEnd = new Date(2025, 0, 1, 18, 0)
    component.rangeForm.setValue({
      fromDate: validStart,
      fromTime: '08:00',
      toDate: validEnd,
      toTime: '18:00',
    })
    triggerValidation()
    const errors = component.validate()
    expect(errors).toBeNull()
  })
})
