import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabellenansichtPageComponent } from './tabellenansicht-page.component';

describe('TabellenansichtPageComponent', () => {
  let component: TabellenansichtPageComponent;
  let fixture: ComponentFixture<TabellenansichtPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabellenansichtPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabellenansichtPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
