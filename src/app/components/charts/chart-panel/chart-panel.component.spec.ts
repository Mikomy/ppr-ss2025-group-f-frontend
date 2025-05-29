import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { By } from '@angular/platform-browser'

import { ChartPanelComponent } from './chart-panel.component'
import { SavedChart } from '../../../models/savedChart.model'
import { ChartType } from 'chart.js'

describe('ChartPanelComponent', () => {
  let component: ChartPanelComponent
  let fixture: ComponentFixture<ChartPanelComponent>

  const dummyConfig: SavedChart & { chartType: ChartType } = {
    id: 'c1',
    titles: ['First', 'Second'],
    label: ['2025-04-01T00:00:00Z', '2025-04-01T01:00:00Z'],
    series: [],
    chartType: 'line',
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartPanelComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(ChartPanelComponent)
    component = fixture.componentInstance
    component.config = dummyConfig
    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should display the combined titles in the header', () => {
    const titleElem: HTMLElement = fixture.debugElement.query(
      By.css('mat-card-title')
    ).nativeElement
    expect(titleElem.textContent?.trim()).toBe('First / Second')
  })

  it('should display the label dates in subtitle', () => {
    const subtitleElem: HTMLElement = fixture.debugElement.query(
      By.css('mat-card-subtitle')
    ).nativeElement
    expect(subtitleElem.textContent?.trim()).toBe(
      'Zeitraum: 2025-04-01T00:00:00Z,2025-04-01T01:00:00Z'
    )
  })

  it('should render app-chart-host element', () => {
    const hostElem = fixture.nativeElement.querySelector('app-chart-host')
    expect(hostElem).toBeTruthy()
  })

  it('should emit remove event with config.id when remove button clicked', () => {
    spyOn(component.remove, 'emit')
    const removeBtn = fixture.debugElement.query(By.css('.remove-btn'))
    removeBtn.triggerEventHandler('click', null)
    expect(component.remove.emit).toHaveBeenCalledWith('c1')
  })
})
