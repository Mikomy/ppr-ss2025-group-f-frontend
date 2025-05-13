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

  it('validate should return required error if any field is missing', () => {
    component.rangeForm.setValue({
      fromDate: null,
      fromTime: null,
      toDate: null,
      toTime: null,
    })
    const errors = component.validate(component.rangeForm)
    expect(errors).toEqual({ required: true })
  })

  it('validate should return rangeInvalid if from > to', () => {
    const date1 = new Date(2025, 0, 2, 12, 0)
    const date2 = new Date(2025, 0, 1, 12, 0)
    // writeValue only sets form controls, combine will calculate
    component.writeValue({
      fromDate: date1,
      fromTime: '12:00',
      toDate: date2,
      toTime: '12:00',
    })
    const errors = component.validate(component.rangeForm)
    expect(errors).toEqual({ rangeInvalid: true })
  })

  it('validate should return null for valid range', () => {
    const date1 = new Date(2025, 0, 1, 10, 0)
    const date2 = new Date(2025, 0, 1, 12, 0)
    component.writeValue({
      fromDate: date1,
      fromTime: '10:00',
      toDate: date2,
      toTime: '12:00',
    })
    const errors = component.validate(component.rangeForm)
    expect(errors).toBeNull()
  })

  it('combine should merge date and time correctly', () => {
    const date = new Date(2025, 4, 13)
    const result = (component as unknown)(date, '08:30')
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(4)
    expect(result.getDate()).toBe(13)
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
    component.setDisabledState?.(true)
    expect(component.rangeForm.disabled).toBeTrue()
    component.setDisabledState?.(false)
    expect(component.rangeForm.enabled).toBeTrue()
  })
})
