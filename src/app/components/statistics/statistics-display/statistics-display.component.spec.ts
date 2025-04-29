import { ComponentFixture, TestBed } from '@angular/core/testing'

import { StatisticsDisplayComponent } from './statistics-display.component'

describe('StatisticsDisplayComponent', () => {
  let component: StatisticsDisplayComponent
  let fixture: ComponentFixture<StatisticsDisplayComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsDisplayComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(StatisticsDisplayComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
