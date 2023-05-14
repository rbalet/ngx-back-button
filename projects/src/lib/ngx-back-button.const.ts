import { InjectionToken } from '@angular/core'
import { NgxBackButtonServiceConfig } from './ngx-back-button.interface'

export const NgxBackButtonServiceProvider = new InjectionToken<NgxBackButtonServiceConfig>(
  'NgxBackButtonServiceConfig',
)
