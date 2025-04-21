import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ChartHostComponent } from './chart-host.component'

describe('ChartHostComponent', () => {
  let component: ChartHostComponent
  let fixture: ComponentFixture<ChartHostComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartHostComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ChartHostComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
