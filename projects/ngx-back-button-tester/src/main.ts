import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { NgxBackButtonServiceProvider } from 'projects/ngx-back-button/src/lib/ngx-back-button.const'
import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

if (environment.production) {
  enableProdMode()
}

const bootstrap = () =>
  platformBrowserDynamic().bootstrapModule(AppModule, {
    providers: [
      {
        provide: NgxBackButtonServiceProvider,
        useValue: {
          rootUrl: 'home',
        },
      },
    ],
  })

bootstrap().catch((err) => console.error(err))
