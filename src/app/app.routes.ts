import { Routes } from '@angular/router';
import {HomePageComponent} from './pages/home-page/home-page.component';
import {
  HistoricalAnalysisComponentComponent
} from './pages/historical-analysis-component/historical-analysis-component.component';
import {StatisticsComponent} from './pages/statistics/statistics.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'history', component: HistoricalAnalysisComponentComponent },
  { path: 'statistics', component: StatisticsComponent }

];
