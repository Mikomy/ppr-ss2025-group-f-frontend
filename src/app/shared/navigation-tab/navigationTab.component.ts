import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { NgForOf } from '@angular/common'

@Component({
  selector: 'app-navigation-tab',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgForOf],
  templateUrl: './navigationTab.component.html',
  styleUrls: ['./navigationTab.component.css'],
})
export class TabNavigationComponent {
  links = [
    { link: '/', label: 'Live-Überblick' },
    { link: '/chart', label: 'Diagramm Analyse' },
    { link: '/statistics', label: 'Statistik' },
    { link: '/table', label: 'Tabelle nach Sensorenauswahl' },
  ]

  nexusLogoImagePath = 'assets/nexus_logo.jpeg'
}
