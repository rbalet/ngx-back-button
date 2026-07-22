import { Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgxBackButtonService } from 'projects/ngx-back-button/src/lib/ngx-back-button.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: `
    :host {
      h1 {
        margin-bottom: 0;
      }
      p {
        margin-top: 0;
      }
    }
  `,
  imports: [RouterModule],
})
export class AppComponent {
  readonly service = inject(NgxBackButtonService)
}
