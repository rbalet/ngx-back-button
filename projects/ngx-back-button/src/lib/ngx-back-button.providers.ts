import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'
import { NgxBackButtonServiceConfig } from './ngx-back-button.interface'

/**
 * Provides the NgxBackButton service with the given configuration.
 * Use this in your root application providers.
 * 
 * @param config Configuration for the NgxBackButton service
 * @returns Environment providers for NgxBackButton
 * 
 * @example
 * ```typescript
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideNgxBackButton({
 *       rootUrl: '/home',
 *       fallbackPrefix: '/tabs'
 *     })
 *   ]
 * })
 * ```
 */
export function provideNgxBackButton(config?: NgxBackButtonServiceConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NgxBackButtonServiceProvider,
      useValue: config || {},
    },
  ])
}

/**
 * Provides child-level configuration for NgxBackButton service.
 * Use this in lazy-loaded route providers to override the root configuration.
 * 
 * @param config Configuration for the NgxBackButton service at child level
 * @returns Environment providers for NgxBackButton child configuration
 * 
 * @example
 * ```typescript
 * export const routes: Routes = [
 *   {
 *     path: 'child',
 *     providers: [
 *       provideNgxBackButtonChild({
 *         rootUrl: '/login'
 *       })
 *     ],
 *     loadComponent: () => import('./child.component')
 *   }
 * ]
 * ```
 */
export function provideNgxBackButtonChild(config?: NgxBackButtonServiceConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NgxBackButtonServiceProvider,
      useValue: config || {},
    },
  ])
}
