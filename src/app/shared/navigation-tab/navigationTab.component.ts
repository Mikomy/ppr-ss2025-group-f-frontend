import { Component } from '@angular/core'
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { NgForOf } from '@angular/common'

@Component({
  selector: 'app-navigation-tab',
  standalone: true,
  imports: [MatTabLink, MatTabNav, MatTabNavPanel, RouterLink, RouterLinkActive, NgForOf],
  templateUrl: './navigationTab.component.html',
  styleUrls: ['./navigationTab.component.css'],
})
export class TabNavigationComponent {
  links = [
    { link: '/', label: 'Live-Überblick' },
    { link: '/history', label: 'Historische Analyse' },
    { link: '/statistics', label: 'Statistik' },
    { link: '/tableView', label: 'Tabelle nach Sensorenauswahl' },
  ]

  nexusLogoImagePath = 'assets/nexus_logo.jpeg'
}
