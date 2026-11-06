import { Location } from '@angular/common'
import { inject, Injectable, Signal, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import {
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Router,
} from '@angular/router'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'
import { NgxBackButtonServiceConfig } from './ngx-back-button.interface'

@Injectable({
  providedIn: 'root',
})
export class NgxBackButtonService {
  readonly #router = inject(Router)
  readonly #location = inject(Location)
  readonly #rootConfig = inject(NgxBackButtonServiceProvider, { optional: true })

  private _history: { id: number; url: string }[] = []
  private _historyIndex = -1
  private _restoredIndex: number | null = null
  private _pendingBack: boolean | null = null
  private _$nextBackNavigationPath = signal(this._getFallBackNavigationPath())

  readonly $nextBackNavigationPath: Signal<string> = this._$nextBackNavigationPath.asReadonly()

  constructor() {
    if (this.#router.navigated) {
      const state = this.#location.getState() as { navigationId?: number } | null
      if (state?.navigationId !== undefined) {
        this._history = [{ id: state.navigationId, url: this.#router.url }]
        this._historyIndex = 0
      }
    }

    this.#router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart && event.navigationTrigger !== 'imperative') {
        this._restoredIndex = this._history.findIndex(
          (entry) => entry.id === event.restoredState?.navigationId,
        )
      }

      if (event instanceof NavigationEnd) {
        const navigation = this.#router.getCurrentNavigation()
        if (!navigation?.extras.skipLocationChange) {
          const entry = { id: event.id, url: event.urlAfterRedirects }
          if (this._restoredIndex !== null) {
            if (this._restoredIndex === -1) this._history = []
            this._historyIndex = Math.max(0, this._restoredIndex)
            this._history[this._historyIndex] = entry
          } else if (
            this._historyIndex >= 0 &&
            (navigation?.extras.replaceUrl || this._history[this._historyIndex].url === entry.url)
          ) {
            this._history[this._historyIndex] = entry
          } else {
            this._history.splice(++this._historyIndex, Infinity, entry)
          }
        }
      } else if (event instanceof NavigationSkipped) {
        // A browser traversal to the same URL has no NavigationStart or NavigationEnd.
        const state = this.#location.getState() as { navigationId?: number } | null
        if (this.#router.getCurrentNavigation()?.trigger !== 'imperative') {
          const matches = this._history.filter((entry) => entry.id === state?.navigationId)
          if (matches.length === 1) {
            this._historyIndex = this._history.indexOf(matches[0])
          } else {
            // Canceled traversals can reuse an ID; do not guess which browser slot is active.
            this._history =
              state?.navigationId === undefined
                ? []
                : [{ id: state.navigationId, url: this.#router.url }]
            this._historyIndex = this._history.length - 1
          }
        }
      } else if (!(event instanceof NavigationCancel || event instanceof NavigationError)) {
        return
      }

      if (event instanceof NavigationCancel && event.code === NavigationCancellationCode.Redirect)
        return
      if (
        (event instanceof NavigationCancel || event instanceof NavigationError) &&
        this._restoredIndex !== null
      ) {
        const state = this.#location.getState() as { navigationId?: number } | null
        if (
          state?.navigationId !== undefined &&
          state.navigationId === this._history[this._historyIndex]?.id
        ) {
          // Angular's default cancellation replaces the traversed-to entry with the current page.
          if (this._restoredIndex === -1) this._history = []
          this._historyIndex = Math.max(0, this._restoredIndex)
          this._history[this._historyIndex] = { id: state.navigationId, url: this.#router.url }
        }
      }
      this._restoredIndex = null
      this._pendingBack = null
      this._updateNextBackNavigationPath()
    })
  }

  getHistory(): string[] {
    return this._history.slice(0, this._historyIndex + 1).map((entry) => entry.url)
  }

  /**
   * @param fallback
   * @param config Optional configuration to override the root configuration (typically from child routes)
   * @return Boolean: True === Had a distinct tracked history entry to go back to
   */
  back(fallback?: string, config?: NgxBackButtonServiceConfig | null): boolean {
    if (this._pendingBack !== null) return this._pendingBack

    const previousIndex = this._getPreviousHistoryIndex()
    this._pendingBack = previousIndex >= 0
    if (this._pendingBack) {
      this.#location.historyGo(previousIndex - this._historyIndex)
      return true
    }

    const path = this._getFallBackNavigationPath(fallback, config)
    this._$nextBackNavigationPath.set(path)
    void this.#router.navigateByUrl(path, { replaceUrl: true }).catch((error) => {
      this._pendingBack = null
      console.error('NgxBackButton: ' + error)
    })
    return false
  }

  private _getPreviousHistoryIndex(): number {
    let index = this._historyIndex - 1
    while (index >= 0 && this._history[index].url === this.#router.url) index--
    return index
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

  private _updateNextBackNavigationPath(): void {
    const previousHistoryEntry = this._history[this._getPreviousHistoryIndex()]?.url

    this._$nextBackNavigationPath.set(previousHistoryEntry ?? this._getFallBackNavigationPath())
  }
}
