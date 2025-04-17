import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule, Routes } from '@angular/router'
import { NgxBackButtonServiceProvider } from 'projects/ngx-back-button/src/lib/ngx-back-button.const'
import { AppComponent } from './app.component'

export const routes: Routes = [
  {
    path: 'home',
    children: [
      {
        path: 'first',
        loadComponent: () => import('./first/first.component').then((m) => m.FirstComponent),
      },
      {
        path: 'second',
        loadComponent: () => import('./second/second.component').then((m) => m.SecondComponent),
      },
      {
        path: 'third',
        loadComponent: () => import('./third/third.component').then((m) => m.ThirdComponent),
      },
      {
        path: '**',
        redirectTo: 'first',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
]

@NgModule({
  declarations: [AppComponent],
  imports: [
    RouterModule.forRoot(routes),

    BrowserModule,
    CommonModule,

    // Forms
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,

    // Mat
    MatButtonModule,
    MatDividerModule,

    // Init
  ],
  providers: [
    {
      provide: NgxBackButtonServiceProvider,
      useValue: {
        rootUrl: '/first',
        fallbackPrefix: '/home', // Added to every fallback url
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
