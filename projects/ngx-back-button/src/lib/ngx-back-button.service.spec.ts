import { TestBed } from '@angular/core/testing'
import { Location } from '@angular/common'
import { NavigationEnd, Router } from '@angular/router'
import { Subject } from 'rxjs'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NgxBackButtonService } from './ngx-back-button.service'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'

describe('NgxBackButtonService', () => {
  let service: NgxBackButtonService
  let location: Location
  let router: Router
  let routerEventsSubject: Subject<any>

  beforeEach(() => {
    routerEventsSubject = new Subject()
    
    const locationMock = {
      back: vi.fn()
    }
    const routerMock = {
      events: routerEventsSubject.asObservable(),
      url: '/current'
    }

    TestBed.configureTestingModule({
      providers: [
        NgxBackButtonService,
        { provide: Location, useValue: locationMock },
        { provide: Router, useValue: routerMock }
      ]
    })

    service = TestBed.inject(NgxBackButtonService)
    location = TestBed.inject(Location)
    router = TestBed.inject(Router)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with empty history', () => {
    expect(service.getHistory()).toEqual([])
  })

  it('should add navigation to history on NavigationEnd', () => {
    // First navigation is skipped
    routerEventsSubject.next(new NavigationEnd(1, '/first', '/first'))
    expect(service.getHistory().length).toBe(0)

    // Second navigation should be added
    routerEventsSubject.next(new NavigationEnd(2, '/second', '/second'))
    expect(service.getHistory()).toEqual(['/second'])

    // Third navigation should be added
    routerEventsSubject.next(new NavigationEnd(3, '/third', '/third'))
    expect(service.getHistory()).toEqual(['/second', '/third'])
  })

  it('should not add navigation to history when navigating back', () => {
    // Build up some history
    routerEventsSubject.next(new NavigationEnd(1, '/first', '/first'))
    routerEventsSubject.next(new NavigationEnd(2, '/second', '/second'))
    routerEventsSubject.next(new NavigationEnd(3, '/third', '/third'))
    
    expect(service.getHistory()).toEqual(['/second', '/third'])

    // Navigate back
    service.back()
    
    // Simulate the NavigationEnd that would occur after back()
    routerEventsSubject.next(new NavigationEnd(4, '/second', '/second'))
    
    // History should not include the navigation that occurred during back
    expect(service.getHistory()).toEqual(['/second'])
  })

  describe('back()', () => {
    it('should return true and call location.back() when history exists', () => {
      // Build up some history
      routerEventsSubject.next(new NavigationEnd(1, '/first', '/first'))
      routerEventsSubject.next(new NavigationEnd(2, '/second', '/second'))
      routerEventsSubject.next(new NavigationEnd(3, '/third', '/third'))

      const result = service.back()

      expect(result).toBe(true)
      expect(location.back).toHaveBeenCalled()
      expect(service.getHistory()).toEqual(['/second'])
    })

    it('should return false when no history exists and use default fallback', () => {
      vi.spyOn(window.history, 'replaceState')
      vi.spyOn(window.history, 'pushState')

      const result = service.back()

      expect(result).toBe(false)
      expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '')
      expect(location.back).toHaveBeenCalled()
    })

    it('should use provided fallback when no history exists', () => {
      vi.spyOn(window.history, 'replaceState')
      vi.spyOn(window.history, 'pushState')

      const result = service.back('/home')

      expect(result).toBe(false)
      expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/home')
    })

    it('should use root config when no history exists', () => {
      TestBed.resetTestingModule()
      
      TestBed.configureTestingModule({
        providers: [
          NgxBackButtonService,
          { provide: Location, useValue: location },
          { provide: Router, useValue: router },
          { 
            provide: NgxBackButtonServiceProvider, 
            useValue: { rootUrl: '/dashboard', fallbackPrefix: '/app' }
          }
        ]
      })

      service = TestBed.inject(NgxBackButtonService)
      
      vi.spyOn(window.history, 'replaceState')
      vi.spyOn(window.history, 'pushState')

      const result = service.back()

      expect(result).toBe(false)
      expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/app/dashboard')
    })

    it('should use child config over root config', () => {
      TestBed.resetTestingModule()
      
      TestBed.configureTestingModule({
        providers: [
          NgxBackButtonService,
          { provide: Location, useValue: location },
          { provide: Router, useValue: router },
          { 
            provide: NgxBackButtonServiceProvider, 
            useValue: { rootUrl: '/dashboard', fallbackPrefix: '/app' }
          }
        ]
      })

      service = TestBed.inject(NgxBackButtonService)
      
      vi.spyOn(window.history, 'replaceState')
      vi.spyOn(window.history, 'pushState')

      const childConfig = { rootUrl: '/login', fallbackPrefix: '/child' }
      const result = service.back(undefined, childConfig)

      expect(result).toBe(false)
      expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/child/login')
    })

    it('should handle errors in replaceState gracefully', () => {
      vi.spyOn(window.history, 'replaceState').mockImplementation(() => {
        throw new Error('Security error')
      })
      vi.spyOn(window.history, 'pushState')
      vi.spyOn(console, 'error')

      const result = service.back('/home')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('NgxBackButton'))
      expect(location.back).toHaveBeenCalled()
    })

    it('should use fallback parameter with fallbackPrefix from config', () => {
      TestBed.resetTestingModule()
      
      TestBed.configureTestingModule({
        providers: [
          NgxBackButtonService,
          { provide: Location, useValue: location },
          { provide: Router, useValue: router },
          { 
            provide: NgxBackButtonServiceProvider, 
            useValue: { fallbackPrefix: '/tabs' }
          }
        ]
      })

      service = TestBed.inject(NgxBackButtonService)
      
      vi.spyOn(window.history, 'replaceState')
      vi.spyOn(window.history, 'pushState')

      const result = service.back('/settings')

      expect(result).toBe(false)
      expect(window.history.replaceState).toHaveBeenCalledWith(null, '', '/tabs/settings')
    })
  })
})
