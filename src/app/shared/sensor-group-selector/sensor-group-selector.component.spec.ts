import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { SensorGroupSelectorComponent } from './sensor-group-selector.component'
import { BackendService } from '../../services/backend.service'
import { DropdownOptionModel } from '../../models/dropdown.option.model'
import { SensorGroup } from '../../models/stats.model'

describe('SensorGroupSelectorComponent', () => {
  let component: SensorGroupSelectorComponent
  let fixture: ComponentFixture<SensorGroupSelectorComponent>
  let backendSpy: jasmine.SpyObj<BackendService>

  const fakeOptions: DropdownOptionModel[] = [
    { measurementName: 'm1', sensor: { id: 's1', name: 'Sensor1', location: 'L1' }, alias: 'c1' },
    { measurementName: 'm2', sensor: { id: 's2', name: 'Sensor2', location: 'L2' }, alias: 'c2' },
  ]

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('BackendService', ['getDropdownOption'])
    spy.getDropdownOption.and.returnValue(of(fakeOptions))

    await TestBed.configureTestingModule({
      imports: [SensorGroupSelectorComponent, HttpClientTestingModule],
      providers: [{ provide: BackendService, useValue: spy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    backendSpy = TestBed.inject(BackendService) as jasmine.SpyObj<BackendService>
    fixture = TestBed.createComponent(SensorGroupSelectorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load and map options on init', () => {
    expect(backendSpy.getDropdownOption).toHaveBeenCalled()
    expect(component.options.length).toBe(2)
    expect(component.options[0]).toEqual(
      jasmine.objectContaining({
        key: '0',
        measurementName: 'm1',
        sensorName: 'Sensor1',
        alias: 'c1',
        display: 'm1 – Sensor1',
      })
    )
    expect(component.options[1].key).toBe('1')
  })

  it('writeValue should set selectedKeys for matching group or clear when null', () => {
    // Matching option c2 → key '1'
    component.writeValue({
      sensors: [{ measurementName: 'm2', sensorName: 'Sensor2', alias: 'c2' }],
    })
    expect(component.selectedKeys).toEqual(['1'])

    // Null group → clear
    component.writeValue(null)
    expect(component.selectedKeys).toEqual([])
  })

  it('setDisabledState should toggle disabled flag', () => {
    expect(component.disabled).toBeFalse()
    component.setDisabledState(true)
    expect(component.disabled).toBeTrue()
  })

  it('trackByKey should return the key', () => {
    const option = component.options[0]
    expect(component.trackByKey(0, option)).toBe(option.key)
  })

  it('onSelectionChange should emit correct SensorGroup', () => {
    const changeSpy: (group: SensorGroup) => void = jasmine.createSpy('onChange')
    component.registerOnChange(changeSpy)

    component.onSelectionChange(['0', '1'])
    expect(component.selectedKeys).toEqual(['0', '1'])
    expect(changeSpy).toHaveBeenCalledWith({
      sensors: [
        { measurementName: 'm1', sensorName: 'Sensor1', alias: 'c1' },
        { measurementName: 'm2', sensorName: 'Sensor2', alias: 'c2' },
      ],
    })
  })

  it('onBlur should call onTouched', () => {
    const touchSpy = jasmine.createSpy('onTouched')
    component.registerOnTouched(touchSpy)
    component.onBlur()
    expect(touchSpy).toHaveBeenCalled()
  })
})
