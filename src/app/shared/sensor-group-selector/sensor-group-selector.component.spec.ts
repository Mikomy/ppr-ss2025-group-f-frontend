import { ComponentFixture, TestBed } from '@angular/core/testing'

import { SensorGroupSelectorComponent } from './sensor-group-selector.component'

describe('SensorGroupSelectorComponent', () => {
  let component: SensorGroupSelectorComponent
  let fixture: ComponentFixture<SensorGroupSelectorComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorGroupSelectorComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(SensorGroupSelectorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
