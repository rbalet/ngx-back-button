import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { NgxBackButtonModule } from '../../../../ngx-back-button/src/lib/ngx-back-button.module'

@Component({
  selector: 'app-third',
  standalone: true,
  imports: [
    CommonModule,

    // Mat
    MatButtonModule,

    // Vendors
    NgxBackButtonModule,
  ],
  templateUrl: 'third.component.html',
  styleUrl: './third.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThirdComponent {}
