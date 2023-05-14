import { Location } from '@angular/common'
import { Inject, Injectable } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { filter } from 'rxjs'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'
import { NgxBackButtonServiceConfig } from './ngx-back-button.interface'

@Injectable()
export class NgxBackButtonService {
  private _history: string[] = []
  private _rootUrl!: string

  constructor(
    @Inject(NgxBackButtonServiceProvider) _config: NgxBackButtonServiceConfig,

    private _router: Router,
    private _location: Location,
  ) {
    this._rootUrl = _config?.rootUrl || '/'

    this._router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event) => {
        this._history.push(event.urlAfterRedirects)
      })
  }

  back(fallback?: string): void {
    fallback = fallback || this._rootUrl
    const record = this._history.pop()

    if (this._history.length > 0) {
      this._location.back()
    } else {
      window.history.replaceState(null, '', fallback)
      window.history.pushState(null, '', record ?? this._router.url)
      this._location.back()
    }
  }
}
