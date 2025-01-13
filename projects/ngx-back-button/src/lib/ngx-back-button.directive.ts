import { Directive, HostListener, Input } from '@angular/core'
import { NgxBackButtonService } from './ngx-back-button.service'

@Directive({
    selector: '[ngxBackButton]',
    standalone: false
})
export class NgxBackButtonDirective {
  @Input() ngxBackButton?: string

  constructor(private _ngxBackButtonService: NgxBackButtonService) {}

  @HostListener('click')
  onClick(): void {
    this._ngxBackButtonService.back(this.ngxBackButton)
  }
}
