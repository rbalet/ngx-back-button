import { enableProdMode, provideZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { provideRouter } from '@angular/router'
import { NgxBackButtonServiceProvider } from 'projects/ngx-back-button/src/lib/ngx-back-button.const'
import { AppComponent } from './app/app.component'
import { routes } from './app/app.routes'
import { environment } from './environments/environment'

if (environment.production) {
  enableProdMode()
}
bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),

    {
      provide: NgxBackButtonServiceProvider,
      useValue: {
        rootUrl: '/first',
        fallbackPrefix: '/home', // Added to every fallback url
      },
    },
  ],
})
