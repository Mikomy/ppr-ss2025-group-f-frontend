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
    path: 'history',
    loadComponent: () =>
      import('./pages/historische-analyse-page/historische-analyse-page.component').then(
        (m) => m.HistorischeAnalysePageComponent
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
    path: 'tableView',
    loadComponent: () =>
      import('./pages/tabellenansicht-page/tabellenansicht-page.component').then(
        (m) => m.TabellenansichtPageComponent
      ),
  },
]
