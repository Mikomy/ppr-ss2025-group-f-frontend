import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RawInfluxDataComponent } from './raw-influx-data.component';

describe('RawInfluxDataComponent', () => {
  let component: RawInfluxDataComponent;
  let fixture: ComponentFixture<RawInfluxDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RawInfluxDataComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RawInfluxDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
