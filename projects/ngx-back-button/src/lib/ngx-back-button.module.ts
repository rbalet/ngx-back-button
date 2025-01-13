import { ModuleWithProviders, NgModule, inject, provideAppInitializer } from '@angular/core'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'
import { NgxBackButtonDirective } from './ngx-back-button.directive'
import { NgxBackButtonServiceConfig } from './ngx-back-button.interface'
import { NgxBackButtonService } from './ngx-back-button.service'

@NgModule({
  declarations: [NgxBackButtonDirective],
  exports: [NgxBackButtonDirective],
})
export class NgxBackButtonModule {
  static forRoot(config: NgxBackButtonServiceConfig): ModuleWithProviders<NgxBackButtonModule> {
    return {
      ngModule: NgxBackButtonModule,
      providers: [
        NgxBackButtonService,
        {
          provide: NgxBackButtonServiceProvider,
          useValue: config,
        },
        provideAppInitializer(() => {
          inject(NgxBackButtonService)
        }),
      ],
    }
  }
}
