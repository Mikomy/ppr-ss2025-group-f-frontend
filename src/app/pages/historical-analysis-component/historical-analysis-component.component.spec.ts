import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalAnalysisComponentComponent } from './historical-analysis-component.component';

describe('HistoricalAnalysisComponentComponent', () => {
  let component: HistoricalAnalysisComponentComponent;
  let fixture: ComponentFixture<HistoricalAnalysisComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricalAnalysisComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricalAnalysisComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
