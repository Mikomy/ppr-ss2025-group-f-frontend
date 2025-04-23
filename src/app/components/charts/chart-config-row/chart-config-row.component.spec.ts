import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ChartConfigRowComponent, ChartType, ChartConfig } from './chart-config-row.component'
import { DropdownOptionModel } from '../../../models/dropdown.option.model'
export interface ChartConfig {
  measurement?: DropdownOptionModel
  color: string
  chartType: ChartType
}
export type ChartType = 'line' | 'bar' | 'heatmap'
describe('ChartConfigRowComponent', () => {
  let component: ChartConfigRowComponent
  let fixture: ComponentFixture<ChartConfigRowComponent>

  const initialConfig: ChartConfig = {
    measurement: DropdownOptionModel,
    color: '#112233',
    chartType: 'line',
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartConfigRowComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ChartConfigRowComponent)
    component = fixture.componentInstance
    // provide a sane default before each test
    component.config = { ...initialConfig }
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('onMeasurementSelected', () => {
    it('updates config.measurement and emits cloned config', () => {
      const dummyOption: DropdownOptionModel = { id: 'foo', label: 'Foo Sensor' }
      spyOn(component.configChange, 'emit')

      component.onMeasurementSelected(dummyOption)

      // the component.config object itself should have been updated
      expect(component.config.measurement).toBe(dummyOption)

      // emit should have been called once…
      expect(component.configChange.emit).toHaveBeenCalledTimes(1)

      // …with a fresh (cloned) payload matching the new state
      const emitted: ChartConfig = (component.configChange.emit as jasmine.Spy).calls.mostRecent()
        .args[0]
      expect(emitted).toEqual({ ...initialConfig, measurement: dummyOption })
      expect(emitted).not.toBe(component.config) // clone check
    })
  })

  describe('onColorChange', () => {
    function makeInputEvent(value: string): Event {
      const input = document.createElement('input')
      input.value = value
      return new Event('input', { bubbles: true, cancelable: true, composed: true, target: input })
    }

    it('updates config.color and emits cloned config', () => {
      const newColor = '#abcdef'
      spyOn(component.configChange, 'emit')

      const event = makeInputEvent(newColor)
      // manually set target so our event carries the color
      Object.defineProperty(event, 'target', { value: { value: newColor } })

      component.onColorChange(event)

      expect(component.config.color).toBe(newColor)
      expect(component.configChange.emit).toHaveBeenCalledTimes(1)

      const emitted: ChartConfig = (component.configChange.emit as jasmine.Spy).calls.mostRecent()
        .args[0]
      expect(emitted).toEqual({ ...initialConfig, color: newColor })
      expect(emitted).not.toBe(component.config)
    })
  })

  describe('onTypeChange', () => {
    it('updates config.chartType and emits cloned config', () => {
      const newType: ChartType = 'bar'
      spyOn(component.configChange, 'emit')

      component.onTypeChange(newType)

      expect(component.config.chartType).toBe(newType)
      expect(component.configChange.emit).toHaveBeenCalledTimes(1)

      const emitted: ChartConfig = (component.configChange.emit as jasmine.Spy).calls.mostRecent()
        .args[0]
      expect(emitted).toEqual({ ...initialConfig, chartType: newType })
      expect(emitted).not.toBe(component.config)
    })
  })
})
