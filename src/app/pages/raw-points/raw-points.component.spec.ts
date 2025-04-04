import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawPointsComponent } from './raw-points.component';

describe('RawPointsComponent', () => {
  let component: RawPointsComponent;
  let fixture: ComponentFixture<RawPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawPointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RawPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
