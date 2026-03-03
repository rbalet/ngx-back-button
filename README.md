# @ngx-back-button 
A library for handling a proper angular back button capability

![NPM](https://img.shields.io/npm/l/ngx-back-button)
[![npm version](https://img.shields.io/npm/v/ngx-back-button.svg)](https://www.npmjs.com/package/ngx-back-button)
![npm bundle size](https://img.shields.io/bundlephobia/min/ngx-back-button)
![npm](https://img.shields.io/npm/dm/ngx-back-button)
[![codecov](https://codecov.io/gh/rbalet/ngx-back-button/branch/main/graph/badge.svg)](https://codecov.io/gh/rbalet/ngx-back-button)

1. Handle Browser history
2. Handle `Fallback` when clicking on the back button when not routed yet
3. Handle custom `Fallback`

## Demo
- https://stackblitz.com/~/github.com/rbalet/ngx-back-button

## Breaking change

## Installation

```sh
npm install ngx-back-button
```

### Optional configuration

#### Using provider functions (Recommended)

To configure the library, use the `provideNgxBackButton` function in your application providers:

```typescript
import { provideNgxBackButton } from 'ngx-back-button'

bootstrapApplication(AppComponent, {
  providers: [
    provideNgxBackButton({
      rootUrl: '/custom', // Or any custom root URL
      fallbackPrefix: '/tabs', // For library users
    }),
  ],
}).catch((err) => console.error(err));
```

#### Child route configuration

You can override the configuration for specific routes using `provideNgxBackButtonChild`:

```typescript
import { provideNgxBackButtonChild } from 'ngx-back-button'

export const routes: Routes = [
  {
    path: 'admin',
    providers: [
      provideNgxBackButtonChild({
        rootUrl: '/admin/dashboard'
      })
    ],
    loadComponent: () => import('./admin/admin.component')
  }
]
```

#### Alternative configuration (Legacy)

You can also configure the library by providing the service configuration directly:

```typescript
import { NgxBackButtonServiceProvider } from 'ngx-back-button'

bootstrapApplication(AppComponent, {
  providers: [
    { // This is optional
      provide:  NgxBackButtonServiceProvider,
      useValue: {
        rootUrl: '/custom', // Or any custom root URL
        fallbackPrefix: '/tabs', // For library users
      },
    },
  ],
}).catch((err) => console.error(err));
```

### rootUrl 
The default fallback in case you're landing on the page and have nothing to go back to.

### fallbackPrefix
Added to the fallback argument.

Use: If you're building a library and wish to put some back button with fallback.

For example, if you build a component with the following:

```html
<button ngxBackButton="/login">
  Back to login
</button>
```

But inside your app, you always have the `/tabs` first.

Adding `fallbackPrefix: '/tabs'` will be the same as if you were doing the following:

```html
<button ngxBackButton="/tabs/login">
  Back to login
</button>
```

## Usage
### Directive

```typescript
import { NgxBackButtonDirective } from 'ngx-back-button'

@Component({
  // ...
  imports: [
    NgxBackButtonDirective,
  ],
```

Normal use:

```html
<button ngxBackButton>
  Back button
</button>
```

With Fallback:

```html
<button ngxBackButton="/login">
  Back to login
</button>
```

### Service

```typescript
// foo.component.ts
import { NgxBackButtonService } from 'ngx-back-button';
// ...

ngxBackButtonService = inject(NgxBackButtonService)
```

Normal use:

```html
<button (click)="ngxBackButtonService.back()">
  Back button
</button>
```

With Fallback:

```html
<button (click)="ngxBackButtonService.back('/login')">
  Back to login
</button>
```

**Note**: When using the service directly (instead of the directive), it will use the root configuration by default. If you need to use a child route configuration, you should inject and pass it manually:

```typescript
import { inject } from '@angular/core';
import { NgxBackButtonService, NgxBackButtonServiceProvider } from 'ngx-back-button';

export class MyComponent {
  private ngxBackButtonService = inject(NgxBackButtonService)
  private config = inject(NgxBackButtonServiceProvider, { optional: true })
  
  goBack() {
    this.ngxBackButtonService.back(undefined, this.config)
  }
}
```

For most use cases, it's recommended to use the directive, which handles this automatically.

## Development

### Running Tests

The library includes comprehensive unit tests with 100% code coverage.

Run tests once:
```sh
npm run test:ci
```

Run tests in watch mode:
```sh
npm test
```

### Building

Build the library:
```sh
npm run build
```

## Authors and acknowledgment
* Maintainer [Raphaël Balet](https://github.com/rbalet)
* Inspired by [Nils Mehlhirn](https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page/)

[![BuyMeACoffee](https://www.buymeacoffee.com/assets/img/custom_images/purple_img.png)](https://www.buymeacoffee.com/widness)
