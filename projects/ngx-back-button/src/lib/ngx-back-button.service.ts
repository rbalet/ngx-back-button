import { Location } from '@angular/common'
import { inject, Injectable, Signal, signal } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { filter, skip } from 'rxjs'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'
import { NgxBackButtonServiceConfig } from './ngx-back-button.interface'

@Injectable({
  providedIn: 'root',
})
export class NgxBackButtonService {
  readonly #router = inject(Router)
  readonly #location = inject(Location)
  readonly #rootConfig = inject(NgxBackButtonServiceProvider, { optional: true })

  private _history: string[] = []
  private _navigatingBack = false
  private _$nextBackNavigationPath = signal(this._getFallBackNavigationPath())

  readonly $nextBackNavigationPath: Signal<string> = this._$nextBackNavigationPath.asReadonly()

  constructor() {
    this.#router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        skip(1), // Skip the first event (initial load)
      )
      .subscribe((event) => {
        if (!this._navigatingBack) this._history.push(event.urlAfterRedirects)

        this._updateNextBackNavigationPath()
        this._navigatingBack = false
      })
  }

  getHistory(): string[] {
    return this._history
  }

  /**
   * @param fallback
   * @param config Optional configuration to override the root configuration (typically from child routes)
   * @return Boolean: True === Had an history to go back to
   */
  back(fallback?: string, config?: NgxBackButtonServiceConfig | null): boolean {
    this._navigatingBack = true

    const record = this._history.pop()
    this._updateNextBackNavigationPath(fallback, config)

    if (this._history.length > 0) {
      this.#location.back()
      return true
    } else {
      this._navigatingBack = false // Give an element to go back to on next navigation

      try {
        window.history.replaceState(null, '', this._getFallBackNavigationPath(fallback, config))
      } catch (error) {
        console.error('NgxBackButton: ' + error)
      }

      window.history.pushState(null, '', record ?? this.#router.url)
      this.#location.back()
      return false
    }
  }

  private _getFallBackNavigationPath(
    fallback?: string,
    config?: NgxBackButtonServiceConfig | null,
  ): string {
    const effectiveConfig = config || this.#rootConfig
    const rootUrl = effectiveConfig?.rootUrl || ''
    const fallbackPrefix = effectiveConfig?.fallbackPrefix || ''
    const fallbackPath = fallback || rootUrl

    if (fallbackPath.startsWith('../')) {
      return this._resolveRelativeFallbackNavigationPath(fallbackPath)
    }

    return fallbackPrefix + fallbackPath
  }

  private _resolveRelativeFallbackNavigationPath(fallback: string): string {
    const suffixIndex = fallback.search(/[?#]/)
    const path = suffixIndex === -1 ? fallback : fallback.slice(0, suffixIndex)
    const suffix = suffixIndex === -1 ? '' : fallback.slice(suffixIndex)
    const fallbackSegments = path.split('/')
    let parentSegmentCount = 0

    while (fallbackSegments[0] === '..') {
      fallbackSegments.shift()
      parentSegmentCount++
    }

    const currentPath = this.#router.url.split(/[?#]/, 1)[0]
    const currentSegments = currentPath.split('/').filter(Boolean)
    const retainedSegments = currentSegments.slice(
      0,
      Math.max(0, currentSegments.length - parentSegmentCount),
    )
    const appendedSegments = fallbackSegments.filter((segment) => segment && segment !== '.')

    return `/${[...retainedSegments, ...appendedSegments].join('/')}${suffix}`
  }

  private _updateNextBackNavigationPath(
    fallback?: string,
    config?: NgxBackButtonServiceConfig | null,
  ): void {
    const previousHistoryEntry = this._history[this._history.length - 2]

    this._$nextBackNavigationPath.set(
      previousHistoryEntry ?? this._getFallBackNavigationPath(fallback, config),
    )
  }
}
