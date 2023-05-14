# @ngx-back-button [![npm version](https://img.shields.io/npm/v/ngx-back-button.svg)](https://www.npmjs.com/package/ngx-back-button)

A library for handling a proper angular back button capability
1. Handle Browser history
2. Handle `Fallback` when clicking on the back button when not routed yet
3. Handle custom `Fallback`

- [@ngx-back-button ](#ngx-back-button-)
  - [Installation](#installation)
    - [rootUrl](#rooturl)
    - [fallbackPrefix](#fallbackprefix)
  - [Usage](#usage)
    - [Directive](#directive)
    - [Service](#service)
  - [Authors and acknowledgment](#authors-and-acknowledgment)

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
      fallbackPrefix: '/tabs' // For libraries users
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

### rootUrl 
The default fallback in case your landing on the page and have nothing to go back to

### fallbackPrefix
Added to the fallback argument.

Use: If you're building a library, wish to put some back button with fallback. 

Let say, you build a component that have the following 
```html
<button ngxBackButton="/login">
  Back to login
</button>
```

But inside your app, you always have the `/tabs` first.

Adding `fallbackPrefix: '/tabs'` will be the same as if you were doing the following

```html
<button ngxBackButton="/tabs/login">
  Back to login
</button>
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
