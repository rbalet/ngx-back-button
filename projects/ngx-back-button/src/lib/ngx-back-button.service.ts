import { Location } from '@angular/common'
import { inject, Injectable } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { filter, skip } from 'rxjs'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'

@Injectable({
  providedIn: 'root',
})
export class NgxBackButtonService {
  readonly #router = inject(Router)
  readonly #location = inject(Location)
  readonly #config = inject(NgxBackButtonServiceProvider, { optional: true })

  private _history: string[] = []
  private _rootUrl!: string // Default Fallback in case we do not have any navigation history
  private _fallbackPrefix!: string // Always added in case of a Fallback (Useful when used within other libraries)

  private _navigatingBack = false

  constructor() {
    this._rootUrl = this.#config?.rootUrl || ''
    this._fallbackPrefix = this.#config?.fallbackPrefix || ''

    this.#router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        skip(1), // Skip the first event (initial load)
      )
      .subscribe((event) => {
        console.log('event', event)
        if (!this._navigatingBack) this._history.push(event.urlAfterRedirects)

        this._navigatingBack = false
      })
  }

  /**
   *
   * @param fallback
   * @return Boolean: True === Had an history to go back to
   */
  back(fallback?: string): boolean {
    this._navigatingBack = true
    const record = this._history.pop()

    console.log(record, this._history, this._history.length > 0)

    if (this._history.length > 0) {
      this.#location.back()
      return true
    } else {
      try {
        console.log()
        window.history.replaceState(null, '', this._fallbackPrefix + (fallback || this._rootUrl))
      } catch (error) {
        console.error('NgxBackButton: ' + error)
      }

      window.history.pushState(null, '', record ?? this.#router.url)
      this.#location.back()
      return false
    }
  }
}
