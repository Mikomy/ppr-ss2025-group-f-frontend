import { ComponentFixture, TestBed } from '@angular/core/testing'
// import { SimpleChange } from '@angular/core';
// import { format, parseISO } from 'date-fns';
import { HeatmapChartComponent } from './heatmap-chart.component'
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts'
import { NO_ERRORS_SCHEMA } from '@angular/core'

describe('HeatmapChartComponent', () => {
  let component: HeatmapChartComponent
  let fixture: ComponentFixture<HeatmapChartComponent>

  // const seriesA = {
  //   label: 'Sensor A',
  //   data: [
  //     { timestamp: '2025-04-01T00:00:00Z', value: 10 },
  //     { timestamp: '2025-04-01T01:00:00Z', value: 20 }
  //   ],
  //   color: '#ff0000'
  // };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeatmapChartComponent, NgxEchartsModule],
      providers: [{ provide: NGX_ECHARTS_CONFIG, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(HeatmapChartComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create the component with empty chartOption', () => {
    expect(component).toBeTruthy()
    expect(component.chartOption).toEqual({})
  })

  // it('should respect input zones when provided', () => {
  //   const custom: Zone[] = [
  //     { start: 0, end: 50, color: '#123456' }
  //   ];
  //   component.zones = custom;
  //   component.dataSeries = [seriesA];
  //   component.ngOnChanges({ dataSeries: new SimpleChange(null, component.dataSeries, true) });
  //
  //   const pieces = (component.chartOption.visualMap as any).pieces as any[];
  //   expect(pieces.length).toBe(1);
  //   expect(pieces[0].gt).toBe(0);
  //   expect(pieces[0].lt).toBe(50);
  //   expect(pieces[0].color).toBe('#123456');
  // });

  // it('formatter should display date as dd.MM. HH:mm', () => {
  //   component.dataSeries = [seriesA];
  //   component.ngOnChanges({ dataSeries: new SimpleChange(null, component.dataSeries, true) });
  //   const axisLabel = (component.chartOption.xAxis as any[])[0].axisLabel;
  //   const formatter: (val: string) => string = axisLabel.formatter;
  //
  //   const formatted = formatter('2025-04-01T12:34:00Z');
  //   const expected = format(parseISO('2025-04-01T12:34:00Z'), 'dd.MM. HH:mm');
  //
  //   expect(formatted).toBe(expected);
  // });
})
