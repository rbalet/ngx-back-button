import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { RouterModule } from '@angular/router'
import { NgxBackButtonDirective } from 'projects/ngx-back-button/src/lib/ngx-back-button.directive'

@Component({
  selector: 'app-second',
  imports: [
    RouterModule,

    // Mat
    MatDividerModule,
    MatButtonModule,

    // Vendors
    NgxBackButtonDirective,
  ],
  templateUrl: './second.component.html',
  styleUrl: './second.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecondComponent {}
