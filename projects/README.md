# @ngx-translate/multi-http-loader [![npm version](https://img.shields.io/npm/v/ngx-back-button.svg)](https://www.npmjs.com/package/ngx-back-button)

A library for handling a proper angular back button capability
1. Handle Browser history
2. Handle `Fallback` when clicking on the back button when not routed yet
3. Handle custom `Fallback`

* [Installation](#installation)
* [Usage](#usage)

## Installation

```sh
npm install ngx-back-button
```

Inside your `app.module.ts` file.
```typescript
import { NgxBackButtonModule, NgxBackButtonService } from 'ngx-back-button'

  imports: [
    NgxBackButtonModule.forRoot(), // Default rootUrl === '/'

    // Or
    NgxBackButtonModule.forRoot({
      rootUrl: '/custom', // Or any custom root url
    }),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => null,
      deps: [NgxBackButtonService],
      multi: true,
    },
  ]
```

## Usage
Wherever you plan to use the back button logic

```typescript
import { NgxBackButtonModule } from 'ngx-back-button'

imports: [
  NgxBackButtonModule,
]
```

Then you can use it in two different way

### Directive
Normal use
```html
<button ngxBackButton>
  Back button
</button>
```

With Fallback
```html
<button ngxBackButton="/login">
  Back to login
</button>
```

### Service
```typescript
// foo.component.ts
import { NgxBackButtonService } from 'ngx-back-button'

// ...
 constructor(public ngxBackButtonService: NgxBackButtonService) {}
```

Normal use
```html
<button (click)="ngxBackButtonService.back()">
  Back button
</button>
```

With Fallback
```html
<button (click)="ngxBackButtonService.back('/login')">
  Back to login
</button>
```

## Authors and acknowledgment
* maintainer [Raphaël Balet](https://github.com/rbalet)
* Inspired by [Nils Mehlhirn](https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page/)
