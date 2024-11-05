import { Location } from '@angular/common'
import { Inject, Injectable } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { filter } from 'rxjs'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'
import { NgxBackButtonServiceConfig } from './ngx-back-button.interface'

@Injectable()
export class NgxBackButtonService {
  private _history: string[] = []
  private _rootUrl!: string // Default Fallback in case we do not have any navigation history
  private _fallbackPrefix!: string // Always added in case of a Fallback (Useful when used within other libraries)

  constructor(
    @Inject(NgxBackButtonServiceProvider) _config: NgxBackButtonServiceConfig,

    private _router: Router,
    private _location: Location,
  ) {
    this._rootUrl = _config?.rootUrl || ''
    this._fallbackPrefix = _config.fallbackPrefix || ''

    this._router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        this._history.push(event.urlAfterRedirects)
      })
  }

  /**
   *
   * @param fallback
   * @return Boolean: True === Had an history to go back to
   */
  back(fallback?: string): boolean {
    const record = this._history.pop()

    if (this._history.length > 0) {
      this._location.back()
      return true
    } else {
      try {
        window.history.replaceState(null, '', this._fallbackPrefix + (fallback || this._rootUrl))
      } catch (error) {
        console.error('NgxBackButton: ' + error)
      }

      window.history.pushState(null, '', record ?? this._router.url)
      this._location.back()
      return false
    }
  }
}
