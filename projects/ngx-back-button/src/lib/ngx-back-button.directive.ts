import { Directive, HostListener, inject, Input } from '@angular/core'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'
import { NgxBackButtonService } from './ngx-back-button.service'

@Directive({
  selector: '[ngxBackButton]',
})
export class NgxBackButtonDirective {
  @Input() ngxBackButton?: string

  private _ngxBackButtonService = inject(NgxBackButtonService)
  private _config = inject(NgxBackButtonServiceProvider, { optional: true })

  @HostListener('click')
  onClick(): void {
    this._ngxBackButtonService.back(this.ngxBackButton, this._config)
  }
}
