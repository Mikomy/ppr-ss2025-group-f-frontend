import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePageComponent } from './home-page.component';
import { SensorDataService } from '../../services/sensorData.service';
import { of } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

// Mock-Daten für Tests
const mockMeasurements = [
  { sensorName: 'Temperature Sensor', value: 22, unit: '°C' },
  { sensorName: 'Humidity Sensor', value: 60, unit: '%' }
];
describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let sensorDataServiceSpy: jasmine.SpyObj<SensorDataService>;

  beforeEach(async () => {
    // Mock für SensorDataService erstellen
    sensorDataServiceSpy = jasmine.createSpyObj('SensorDataService', ['getLatestMeasurements']);
    await TestBed.configureTestingModule({
      providers: [{ provide: SensorDataService, useValue: sensorDataServiceSpy }],
      imports: [MatCardModule, CommonModule, HomePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch measurements on init', () => {
    sensorDataServiceSpy.getLatestMeasurements.and.returnValue(of(mockMeasurements));

    fixture.detectChanges();
    expect(component.measurements).toEqual(mockMeasurements);
  })

});
