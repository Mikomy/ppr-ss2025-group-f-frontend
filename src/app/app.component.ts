import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import {TabNavigationComponent} from './shared/navigation-tab/navigationTab.component';

interface ParticlesJS {
  load: (id: string, path: string, callback: () => void) => void;
}
declare const particlesJS: ParticlesJS;
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatTabsModule, TabNavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'nexus-frontend';

  ngOnInit() {
    particlesJS.load('particles', 'assets/particles.json', () => {
      console.log('Particles.json config loaded');
    })
  }
}
