import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ScatterChartComponent } from './scatter-chart.component'

describe('ScatterChartComponent', () => {
  let component: ScatterChartComponent
  let fixture: ComponentFixture<ScatterChartComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScatterChartComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ScatterChartComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
