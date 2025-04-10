import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TabNavigationComponent } from './navigationTab.component'
import { RouterTestingModule } from '@angular/router/testing'

describe('TabNavigationComponent', () => {
  let component: TabNavigationComponent
  let fixture: ComponentFixture<TabNavigationComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabNavigationComponent, RouterTestingModule],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TabNavigationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have defined links', () => {
    expect(component.links).toBeDefined()
    expect(component.links.length).toBe(4)
    expect(component.links[0]).toEqual({ link: '/', label: 'Live-Überblick' })
  })

  it('should render navigation links in template', () => {
    const linkElements: HTMLElement[] = fixture.nativeElement.querySelectorAll('a[mat-tab-link]')
    expect(linkElements.length).toBe(component.links.length)
    component.links.forEach((linkItem, index) => {
      const element: HTMLElement = linkElements[index]
      expect(element.textContent).toContain(linkItem.label)
    })
  })

  it('should have correct routerLink values on each navigation link', () => {
    const linkElements: HTMLElement[] = fixture.nativeElement.querySelectorAll('a[mat-tab-link]')
    expect(linkElements.length).toBe(component.links.length)

    component.links.forEach((linkItem, index) => {
      const element: HTMLElement = linkElements[index]
      const expectedLink = '/' + linkItem.link
      const routerLinkValue = element.getAttribute('ng-reflect-router-link') || ''
      expect(routerLinkValue).toBe(expectedLink)
    })
  })
})
