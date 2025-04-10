import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { MatTabsModule } from '@angular/material/tabs'
import { TabNavigationComponent } from './shared/navigation-tab/navigationTab.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatTabsModule, TabNavigationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'nexus-frontend'
}
