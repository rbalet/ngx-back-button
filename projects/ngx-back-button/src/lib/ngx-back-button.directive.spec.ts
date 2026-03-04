import { Component, DebugElement } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NgxBackButtonDirective } from './ngx-back-button.directive'
import { NgxBackButtonService } from './ngx-back-button.service'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'
import { Location } from '@angular/common'
import { Router } from '@angular/router'
import { Subject } from 'rxjs'

@Component({
  template: `
    <button ngxBackButton>Back</button>
    <button [ngxBackButton]="fallback">Back with fallback</button>
  `,
  standalone: true,
  imports: [NgxBackButtonDirective]
})
class TestComponent {
  fallback = '/home'
}

describe('NgxBackButtonDirective', () => {
  let component: TestComponent
  let fixture: ComponentFixture<TestComponent>
  let service: NgxBackButtonService
  let buttons: DebugElement[]

  beforeEach(async () => {
    const routerEventsSubject = new Subject()
    const locationMock = {
      back: vi.fn()
    }
    const routerMock = {
      events: routerEventsSubject.asObservable(),
      url: '/current'
    }

    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        NgxBackButtonService,
        { provide: Location, useValue: locationMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TestComponent)
    component = fixture.componentInstance
    service = TestBed.inject(NgxBackButtonService)
    fixture.detectChanges()

    buttons = fixture.debugElement.queryAll(By.directive(NgxBackButtonDirective))
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should attach directive to buttons', () => {
    expect(buttons.length).toBe(2)
  })

  it('should call service.back() without fallback on click', () => {
    vi.spyOn(service, 'back')
    
    buttons[0].nativeElement.click()
    
    expect(service.back).toHaveBeenCalledWith('', null)
  })

  it('should call service.back() with fallback on click', () => {
    vi.spyOn(service, 'back')
    
    buttons[1].nativeElement.click()
    
    expect(service.back).toHaveBeenCalledWith('/home', null)
  })

  it('should pass child config to service', async () => {
    const childConfig = { rootUrl: '/login', fallbackPrefix: '/child' }
    
    await TestBed.resetTestingModule()
    
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        NgxBackButtonService,
        { provide: Location, useValue: { back: vi.fn() } },
        { provide: Router, useValue: { events: new Subject().asObservable(), url: '/current' } },
        { provide: NgxBackButtonServiceProvider, useValue: childConfig }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TestComponent)
    service = TestBed.inject(NgxBackButtonService)
    fixture.detectChanges()

    vi.spyOn(service, 'back')
    
    const button = fixture.debugElement.query(By.directive(NgxBackButtonDirective))
    button.nativeElement.click()
    
    expect(service.back).toHaveBeenCalledWith('', childConfig)
  })

  it('should work with different fallback values', () => {
    vi.spyOn(service, 'back')
    
    // Test that fallback parameter is properly passed
    buttons[1].nativeElement.click()
    
    expect(service.back).toHaveBeenCalledWith('/home', null)
  })
})
