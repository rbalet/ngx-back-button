# @ngx-back-button 
A library for handling a proper angular back button capability

![NPM](https://img.shields.io/npm/l/ngx-back-button)
[![npm version](https://img.shields.io/npm/v/ngx-back-button.svg)](https://www.npmjs.com/package/ngx-back-button)
![npm bundle size](https://img.shields.io/bundlephobia/min/ngx-back-button)
![npm](https://img.shields.io/npm/dm/ngx-back-button)

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

To configure the library, provide the `NgxBackButtonService` and its configuration globally in your `main.ts` file:

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

## Authors and acknowledgment
* Maintainer [Raphaël Balet](https://github.com/rbalet)
* Inspired by [Nils Mehlhirn](https://nils-mehlhorn.de/posts/angular-navigate-back-previous-page/)

[![BuyMeACoffee](https://www.buymeacoffee.com/assets/img/custom_images/purple_img.png)](https://www.buymeacoffee.com/widness)
