import { Routes } from '@angular/router'
import { provideNgxBackButtonChild } from 'projects/ngx-back-button/src/lib/ngx-back-button.providers'

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
        providers: [
          provideNgxBackButtonChild({
            rootUrl: '/home/second',
          }),
        ],
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
