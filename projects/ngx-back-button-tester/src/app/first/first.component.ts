import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-first',
  imports: [
    RouterModule,

    // Mat
    MatButtonModule,
  ],
  templateUrl: 'first.component.html',
  styleUrl: './first.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FirstComponent {}
