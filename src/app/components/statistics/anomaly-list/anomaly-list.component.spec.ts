import { ComponentFixture, TestBed } from '@angular/core/testing'
import { AnomalyListComponent } from './anomaly-list.component'
import { MatCardModule } from '@angular/material/card'
import { MatTableModule } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { CommonModule } from '@angular/common'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

describe('AnomalyListComponent', () => {
  let component: AnomalyListComponent
  let fixture: ComponentFixture<AnomalyListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AnomalyListComponent,
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        NoopAnimationsModule,
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(AnomalyListComponent)
    component = fixture.componentInstance
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should display the provided title', () => {
    const titleText = 'Test Anomalies'
    component.title = titleText
    component.anomalies = []
    fixture.detectChanges()
    const titleEl: HTMLElement = fixture.nativeElement.querySelector('mat-card-title')
    expect(titleEl.textContent).toContain(titleText)
  })

  it('should show no anomalies message when list is empty', () => {
    component.anomalies = []
    fixture.detectChanges()
    const messageEl: HTMLElement = fixture.nativeElement.querySelector('p')
    expect(messageEl).toBeTruthy()
    expect(messageEl.textContent).toContain('Keine Ausreißer')
    const tableEl = fixture.nativeElement.querySelector('table')
    expect(tableEl).toBeNull()
  })

  it('should render table rows for each anomaly', () => {
    const now = Date.now()
    component.anomalies = [
      { timestamp: new Date(now), value: 1.1, type: 'low' },
      { timestamp: new Date(now + 500), value: 2.2, type: 'high' },
    ]
    component.otherTimestamps = []
    component.otherLabel = 'Simultaneous'
    fixture.detectChanges()

    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]')
    expect(rows.length).toBe(2)
    const firstRowCells = rows[0].querySelectorAll('td[mat-cell]')
    expect(firstRowCells[1].textContent.trim()).toBe('1.10')
    expect(firstRowCells[2].textContent.trim()).toBe('low')
  })

  it('should display check_circle icon for simultaneous timestamps', () => {
    const now = Date.now()
    component.anomalies = [{ timestamp: new Date(now), value: 0, type: 'low' }]
    component.otherTimestamps = [now]
    component.otherLabel = 'Pair'
    fixture.detectChanges()

    const iconEl: HTMLElement = fixture.nativeElement.querySelector('mat-icon')
    expect(iconEl).toBeTruthy()
    expect(iconEl.textContent).toContain('check_circle')
  })

  it('isSimultaneous should correctly identify timestamps', () => {
    const ts1 = 123
    const ts2 = 456
    component.otherTimestamps = [ts1]
    expect(component.isSimultaneous(new Date(ts1))).toBeTrue()
    expect(component.isSimultaneous(new Date(ts2))).toBeFalse()
  })
})
