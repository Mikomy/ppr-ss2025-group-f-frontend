import { Routes } from '@angular/router'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home-page/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home-page/home-page.component').then((m) => m.HomePageComponent),
  },
  {
    path: 'chart',
    loadComponent: () =>
      import('./pages/chart-view-page/chart-view-page.component').then(
        (m) => m.ChartViewPageComponent
      ),
  },
  {
    path: 'statistics',
    loadComponent: () =>
      import('./pages/statistics-page/statistics-page.component').then(
        (m) => m.StatisticsPageComponent
      ),
  },
  {
    path: 'table',
    loadComponent: () =>
      import('./pages/table-view-page/table-view-page.component').then(
        (m) => m.TableViewPageComponent
      ),
  },
]
