import { Location } from '@angular/common'
import { inject, Injectable } from '@angular/core'
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

  constructor() {
    this.#router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        skip(1), // Skip the first event (initial load)
      )
      .subscribe((event) => {
        if (!this._navigatingBack) this._history.push(event.urlAfterRedirects)

        this._navigatingBack = false
      })
  }

  getHistory(): string[] {
    return this._history
  }

  /**
   *
   * @param fallback
   * @param config Optional configuration to override the root configuration (typically from child routes)
   * @return Boolean: True === Had an history to go back to
   */
  back(fallback?: string, config?: NgxBackButtonServiceConfig | null): boolean {
    this._navigatingBack = true

    const record = this._history.pop()

    if (this._history.length > 0) {
      this.#location.back()
      return true
    } else {
      this._navigatingBack = false // Give an element to go back to on next navigation

      // Use provided config (from child route) or fall back to root config
      const effectiveConfig = config || this.#rootConfig
      const rootUrl = effectiveConfig?.rootUrl || ''
      const fallbackPrefix = effectiveConfig?.fallbackPrefix || ''

      try {
        window.history.replaceState(null, '', fallbackPrefix + (fallback || rootUrl))
      } catch (error) {
        console.error('NgxBackButton: ' + error)
      }

      window.history.pushState(null, '', record ?? this.#router.url)
      this.#location.back()
      return false
    }
  }
}
