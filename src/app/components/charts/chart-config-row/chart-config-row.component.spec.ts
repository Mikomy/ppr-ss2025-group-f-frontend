import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ChartConfigRowComponent } from './chart-config-row.component'

describe('ChartConfigRowComponent', () => {
  let component: ChartConfigRowComponent
  let fixture: ComponentFixture<ChartConfigRowComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartConfigRowComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ChartConfigRowComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
