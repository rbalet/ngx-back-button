import {
  APP_BASE_HREF,
  Location,
  LocationStrategy,
  PathLocationStrategy,
  PlatformLocation,
} from '@angular/common'
import { MockPlatformLocation } from '@angular/common/testing'
import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  provideRouter,
  Router,
} from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { filter, firstValueFrom } from 'rxjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NgxBackButtonService } from './ngx-back-button.service'
import { provideNgxBackButton } from './ngx-back-button.providers'

@Component({ standalone: true, template: '' })
class Page {}

describe('browser navigation history', () => {
  let router: Router
  let service: NgxBackButtonService
  let platform: MockPlatformLocation
  let canLeave: boolean
  let redirectBack: boolean

  beforeEach(() => {
    canLeave = true
    redirectBack = false
    platform = new MockPlatformLocation({ startUrl: 'http://localhost/' })
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'redirecting',
            component: Page,
            canActivate: [
              () => (redirectBack ? TestBed.inject(Router).parseUrl('/replacement') : true),
            ],
          },
          { path: 'guarded', component: Page, canDeactivate: [() => canLeave] },
          { path: 'blocked', component: Page, canActivate: [() => false] },
          { path: '**', component: Page },
        ]),
        { provide: PlatformLocation, useValue: platform },
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        { provide: APP_BASE_HREF, useValue: '/' },
        provideNgxBackButton({ rootUrl: '/home' }),
      ],
    })
    service = TestBed.inject(NgxBackButtonService)
    router = TestBed.inject(Router)
    router.setUpLocationChangeListener()
  })

  afterEach(() => {
    TestBed.resetTestingModule()
    vi.restoreAllMocks()
  })

  async function traverse(action: () => unknown) {
    const completed = firstValueFrom(
      router.events.pipe(
        filter(
          (event) =>
            event instanceof NavigationEnd ||
            event instanceof NavigationSkipped ||
            event instanceof NavigationCancel ||
            event instanceof NavigationError,
        ),
      ),
    )
    action()
    await completed
  }

  it('returns to the initial page instead of the fallback', async () => {
    await RouterTestingHarness.create('/explore')
    await router.navigateByUrl('/moments/one')
    expect(service.$nextBackNavigationPath()).toBe('/explore')

    await traverse(() => expect(service.back('../')).toBe(true))

    expect(router.url).toBe('/explore')
    expect(service.getHistory()).toEqual(['/explore'])
  })

  it('replaces filters in history instead of appending them', async () => {
    await RouterTestingHarness.create('/explore')
    await router.navigateByUrl('/moments')
    await router.navigateByUrl('/moments?filter=past', { replaceUrl: true })

    expect(service.getHistory()).toEqual(['/explore', '/moments?filter=past'])
    await traverse(() => service.back())
    expect(router.url).toBe('/explore')
  })

  it('skips duplicate Moment entries after returning from Chat with replaceUrl', async () => {
    await RouterTestingHarness.create('/moments')
    await router.navigateByUrl('/moments/one')
    await router.navigateByUrl('/moments/one/chat/two')
    await router.navigateByUrl('/moments/one', { replaceUrl: true })

    expect(service.$nextBackNavigationPath()).toBe('/moments')
    await traverse(() => service.back('../'))
    expect(router.url).toBe('/moments')

    await router.navigateByUrl('/moments/other')
    expect(service.getHistory()).toEqual(['/moments', '/moments/other'])
  })

  it('follows browser Back and Forward before a service Back', async () => {
    await RouterTestingHarness.create('/first')
    await router.navigateByUrl('/second')
    await router.navigateByUrl('/third')

    await traverse(() => platform.back())
    expect(service.getHistory()).toEqual(['/first', '/second'])
    await traverse(() => platform.forward())
    expect(service.getHistory()).toEqual(['/first', '/second', '/third'])
    await traverse(() => service.back())
    expect(router.url).toBe('/second')
    await traverse(() => service.back())
    expect(router.url).toBe('/first')
  })

  it('handles a browser Back that Angular skips because the URL is unchanged', async () => {
    await RouterTestingHarness.create('/first')
    await router.navigateByUrl('/second')
    await router.navigateByUrl('/third')
    await router.navigateByUrl('/second', { replaceUrl: true })

    await traverse(() => platform.back())
    expect(router.url).toBe('/second')
    expect(service.getHistory()).toEqual(['/first', '/second'])
    await traverse(() => service.back())
    expect(router.url).toBe('/first')
  })

  it('does not create browser history for skipLocationChange or same-URL reloads', async () => {
    await RouterTestingHarness.create('/first')
    await router.navigateByUrl('/second')
    await router.navigateByUrl('/second', { onSameUrlNavigation: 'reload' })
    await router.navigateByUrl('/hidden', { skipLocationChange: true })

    expect(service.getHistory()).toEqual(['/first', '/second'])
    await traverse(() => service.back())
    expect(router.url).toBe('/first')
  })

  it('uses a routed fallback on a direct link and keeps tracking afterward', async () => {
    await RouterTestingHarness.create('/moments/one/chat/two')
    await traverse(() => expect(service.back('../../')).toBe(false))
    expect(router.url).toBe('/moments/one')
    expect(service.getHistory()).toEqual(['/moments/one'])

    await router.navigateByUrl('/other')
    await traverse(() => service.back())
    expect(router.url).toBe('/moments/one')
  })

  it('keeps history when a fallback is rejected by a guard', async () => {
    await RouterTestingHarness.create('/first')
    await traverse(() => service.back('/blocked'))
    expect(router.url).toBe('/first')
    expect(service.getHistory()).toEqual(['/first'])

    await router.navigateByUrl('/second')
    await traverse(() => service.back())
    expect(router.url).toBe('/first')
  })

  it('reconciles a browser Back rejected by a guard before trying again', async () => {
    await RouterTestingHarness.create('/first')
    await router.navigateByUrl('/second')
    await router.navigateByUrl('/guarded')
    canLeave = false

    await traverse(() => service.back())
    expect(router.url).toBe('/guarded')
    // Angular's default cancellation replaces the destination history entry.
    expect(service.getHistory()).toEqual(['/first', '/guarded'])

    canLeave = true
    await traverse(() => service.back())
    expect(router.url).toBe('/first')
  })

  it('does not guess a history offset after Forward into a duplicated canceled entry', async () => {
    await RouterTestingHarness.create('/first')
    await router.navigateByUrl('/second')
    await router.navigateByUrl('/guarded')
    canLeave = false
    await traverse(() => service.back())
    canLeave = true
    await traverse(() => platform.forward())

    expect(service.getHistory()).toEqual(['/guarded'])
    await router.navigateByUrl('/other')
    await traverse(() => service.back())
    expect(router.url).toBe('/guarded')
  })

  it('replaces the restored entry when a Back navigation redirects', async () => {
    await RouterTestingHarness.create('/first')
    await router.navigateByUrl('/redirecting')
    await router.navigateByUrl('/third')
    redirectBack = true

    const completed = firstValueFrom(
      router.events.pipe(filter((event) => event instanceof NavigationEnd)),
    )
    service.back()
    await completed

    expect(router.url).toBe('/replacement')
    expect(service.getHistory()).toEqual(['/first', '/replacement'])
    await traverse(() => service.back())
    expect(router.url).toBe('/first')
  })

  it('tracks the current page when the service is first injected after routing', async () => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: Page }]),
        { provide: PlatformLocation, useValue: platform },
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    })
    router = TestBed.inject(Router)
    router.setUpLocationChangeListener()
    await RouterTestingHarness.create('/first')
    service = TestBed.inject(NgxBackButtonService)
    await router.navigateByUrl('/second')

    await traverse(() => service.back('/fallback'))
    expect(router.url).toBe('/first')
  })

  it('ignores repeated Back presses while traversal is pending', async () => {
    await RouterTestingHarness.create('/first')
    await router.navigateByUrl('/second')
    await router.navigateByUrl('/third')
    const historyGo = vi.spyOn(TestBed.inject(Location), 'historyGo')

    await traverse(() => {
      service.back()
      service.back()
    })

    expect(router.url).toBe('/second')
    expect(historyGo).toHaveBeenCalledTimes(1)
  })
})
