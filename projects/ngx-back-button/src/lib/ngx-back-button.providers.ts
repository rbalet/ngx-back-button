import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'
import { NgxBackButtonServiceConfig } from './ngx-back-button.interface'

/**
 * Internal function to create environment providers for NgxBackButton configuration.
 * @internal
 */
function createNgxBackButtonProviders(config?: NgxBackButtonServiceConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NgxBackButtonServiceProvider,
      useValue: config || {},
    },
  ])
}

/**
 * Provides the NgxBackButton service with the given configuration.
 * Use this in your root application providers.
 * 
 * When both root and child configurations are provided, the child configuration
 * will override the root configuration for routes under that path, following
 * Angular's hierarchical dependency injection.
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
  return createNgxBackButtonProviders(config)
}

/**
 * Provides child-level configuration for NgxBackButton service.
 * Use this in lazy-loaded route providers to override the root configuration.
 * 
 * This configuration will override the root configuration for all components
 * and directives within the route's component tree, following Angular's
 * hierarchical dependency injection.
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
  return createNgxBackButtonProviders(config)
}
