import { Location } from '@angular/common'
import { TestBed } from '@angular/core/testing'
import { NavigationEnd, NavigationStart, Router } from '@angular/router'
import { Subject } from 'rxjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'
import { NgxBackButtonService } from './ngx-back-button.service'

describe('NgxBackButtonService', () => {
  let service: NgxBackButtonService
  let location: Location
  let router: Router
  let routerEventsSubject: Subject<any>

  beforeEach(() => {
    routerEventsSubject = new Subject()

    const locationMock = {
      historyGo: vi.fn(),
      getState: vi.fn(() => ({})),
    }
    const routerMock = {
      events: routerEventsSubject.asObservable(),
      url: '/current',
      getCurrentNavigation: vi.fn(),
      navigateByUrl: vi.fn().mockResolvedValue(true),
    }

    TestBed.configureTestingModule({
      providers: [
        NgxBackButtonService,
        { provide: Location, useValue: locationMock },
        { provide: Router, useValue: routerMock },
      ],
    })

    service = TestBed.inject(NgxBackButtonService)
    location = TestBed.inject(Location)
    router = TestBed.inject(Router)
  })

  afterEach(() => {
    TestBed.resetTestingModule()
    vi.restoreAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize with empty history', () => {
    expect(service.getHistory()).toEqual([])
  })

  it('should initialize with empty next back navigation name', () => {
    expect(service.$nextBackNavigationPath()).toBe('')
  })

  it('should expose next back navigation name as a readonly signal', () => {
    expect('set' in service.$nextBackNavigationPath).toBe(false)
    expect('update' in service.$nextBackNavigationPath).toBe(false)
  })

  it('should add navigation to history on NavigationEnd', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/first', '/first'))
    expect(service.getHistory()).toEqual(['/first'])

    // Second navigation should be added
    routerEventsSubject.next(new NavigationEnd(2, '/second', '/second'))
    expect(service.getHistory()).toEqual(['/first', '/second'])

    // Third navigation should be added
    routerEventsSubject.next(new NavigationEnd(3, '/third', '/third'))
    expect(service.getHistory()).toEqual(['/first', '/second', '/third'])
  })

  it('should update next back navigation name from tracked history', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/first', '/first'))
    expect(service.$nextBackNavigationPath()).toBe('')

    routerEventsSubject.next(new NavigationEnd(2, '/second', '/second'))
    expect(service.$nextBackNavigationPath()).toBe('/first')

    routerEventsSubject.next(new NavigationEnd(3, '/third', '/third'))
    expect(service.$nextBackNavigationPath()).toBe('/second')
  })

  it('should not add navigation to history when navigating back', () => {
    // Build up some history
    routerEventsSubject.next(new NavigationEnd(1, '/first', '/first'))
    routerEventsSubject.next(new NavigationEnd(2, '/second', '/second'))
    routerEventsSubject.next(new NavigationEnd(3, '/third', '/third'))

    expect(service.getHistory()).toEqual(['/first', '/second', '/third'])
    expect(service.$nextBackNavigationPath()).toBe('/second')

    // Navigate back
    service.back()
    expect(service.$nextBackNavigationPath()).toBe('/second')

    // Simulate the NavigationEnd that would occur after back()
    routerEventsSubject.next(new NavigationStart(4, '/second', 'popstate', { navigationId: 2 }))
    routerEventsSubject.next(new NavigationEnd(4, '/second', '/second'))

    // History should not include the navigation that occurred during back
    expect(service.getHistory()).toEqual(['/first', '/second'])
  })

  describe('back()', () => {
    it('should traverse history without changing it until navigation succeeds', () => {
      // Build up some history
      routerEventsSubject.next(new NavigationEnd(1, '/first', '/first'))
      routerEventsSubject.next(new NavigationEnd(2, '/second', '/second'))
      routerEventsSubject.next(new NavigationEnd(3, '/third', '/third'))

      const result = service.back()

      expect(result).toBe(true)
      expect(location.historyGo).toHaveBeenCalledWith(-1)
      expect(service.getHistory()).toEqual(['/first', '/second', '/third'])
    })

    it('should return false when no history exists and use default fallback', () => {
      const result = service.back()

      expect(result).toBe(false)
      expect(router.navigateByUrl).toHaveBeenCalledWith('', { replaceUrl: true })
    })

    it('should use provided fallback when no history exists', () => {
      const result = service.back('/home')

      expect(result).toBe(false)
      expect(service.$nextBackNavigationPath()).toBe('/home')
      expect(router.navigateByUrl).toHaveBeenCalledWith('/home', { replaceUrl: true })
    })

    it('should resolve each ../ fallback segment against the current route', () => {
      Object.defineProperty(router, 'url', {
        configurable: true,
        value: '/foo/123/bar/456',
      })

      const result = service.back('../../')

      expect(result).toBe(false)
      expect(service.$nextBackNavigationPath()).toBe('/foo/123')
      expect(router.navigateByUrl).toHaveBeenCalledWith('/foo/123', { replaceUrl: true })
    })

    it('should support a path, query, and fragment after relative parent segments', () => {
      Object.defineProperty(router, 'url', {
        configurable: true,
        value: '/foo/123/bar/456?previous=value#old',
      })

      service.back('../../summary?view=compact#details')

      expect(router.navigateByUrl).toHaveBeenCalledWith('/foo/123/summary?view=compact#details', {
        replaceUrl: true,
      })
    })

    it('should resolve relative fallbacks to the root without traversing above it', () => {
      Object.defineProperty(router, 'url', {
        configurable: true,
        value: '/foo/123',
      })

      service.back('../../../')

      expect(router.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true })
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
            useValue: { rootUrl: '/dashboard', fallbackPrefix: '/app' },
          },
        ],
      })

      service = TestBed.inject(NgxBackButtonService)
      expect(service.$nextBackNavigationPath()).toBe('/app/dashboard')

      const result = service.back()

      expect(result).toBe(false)
      expect(router.navigateByUrl).toHaveBeenCalledWith('/app/dashboard', { replaceUrl: true })
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
            useValue: { rootUrl: '/dashboard', fallbackPrefix: '/app' },
          },
        ],
      })

      service = TestBed.inject(NgxBackButtonService)

      const childConfig = { rootUrl: '/login', fallbackPrefix: '/child' }
      const result = service.back(undefined, childConfig)

      expect(result).toBe(false)
      expect(service.$nextBackNavigationPath()).toBe('/child/login')
      expect(router.navigateByUrl).toHaveBeenCalledWith('/child/login', { replaceUrl: true })
    })

    it('should report fallback navigation errors and allow another attempt', async () => {
      vi.mocked(router.navigateByUrl).mockRejectedValueOnce(new Error('Navigation failed'))
      vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(service.back('/home')).toBe(false)
      await Promise.resolve()

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Navigation failed'))
      service.back('/retry')
      expect(router.navigateByUrl).toHaveBeenLastCalledWith('/retry', { replaceUrl: true })
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
            useValue: { fallbackPrefix: '/tabs' },
          },
        ],
      })

      service = TestBed.inject(NgxBackButtonService)

      const result = service.back('/settings')

      expect(result).toBe(false)
      expect(router.navigateByUrl).toHaveBeenCalledWith('/tabs/settings', { replaceUrl: true })
    })

    it('should resolve relative fallbacks from the current route instead of prefixing them', () => {
      TestBed.resetTestingModule()

      const relativeRouter = {
        events: new Subject().asObservable(),
        url: '/tabs/foo/123/bar/456',
        navigateByUrl: vi.fn().mockResolvedValue(true),
      }

      TestBed.configureTestingModule({
        providers: [
          NgxBackButtonService,
          { provide: Location, useValue: location },
          { provide: Router, useValue: relativeRouter },
          {
            provide: NgxBackButtonServiceProvider,
            useValue: { fallbackPrefix: '/tabs' },
          },
        ],
      })

      service = TestBed.inject(NgxBackButtonService)

      service.back('../../')

      expect(relativeRouter.navigateByUrl).toHaveBeenCalledWith('/tabs/foo/123', {
        replaceUrl: true,
      })
    })
  })
})
