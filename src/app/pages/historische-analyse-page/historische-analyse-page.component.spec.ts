import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorischeAnalysePageComponent } from './historische-analyse-page.component';

describe('HistorischeAnalysePageComponent', () => {
  let component: HistorischeAnalysePageComponent;
  let fixture: ComponentFixture<HistorischeAnalysePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorischeAnalysePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorischeAnalysePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
