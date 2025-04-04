import { Routes } from '@angular/router';
import { RawPointsComponent } from './pages/raw-points/raw-points.component';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent) },
  { path: 'home', loadComponent: () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent) },
  { path: 'history', loadComponent: () => import('./pages/historical-analysis-component/historical-analysis-component.component').then(m => m.HistoricalAnalysisComponentComponent) },
  { path: 'statistics', loadComponent: () => import('./pages/statistics/statistics.component').then(m => m.StatisticsComponent) },
  { path: 'measurements', loadComponent: () => import('./pages/raw-influx-data/raw-influx-data.component').then(m => m.RawInfluxDataComponent) },
  { path: 'raw-points/:id', loadComponent: () => import('./pages/raw-points/raw-points.component').then(m => m.RawPointsComponent) },
];
