import { TestBed } from '@angular/core/testing'
import { provideNgxBackButton, provideNgxBackButtonChild } from './ngx-back-button.providers'
import { NgxBackButtonServiceProvider } from './ngx-back-button.const'

describe('NgxBackButton Providers', () => {
  describe('provideNgxBackButton', () => {
    it('should provide NgxBackButtonServiceProvider with config', () => {
      const config = { rootUrl: '/home', fallbackPrefix: '/app' }
      
      TestBed.configureTestingModule({
        providers: [provideNgxBackButton(config)]
      })

      const provider = TestBed.inject(NgxBackButtonServiceProvider)
      expect(provider).toEqual(config)
    })

    it('should provide NgxBackButtonServiceProvider with empty config', () => {
      TestBed.configureTestingModule({
        providers: [provideNgxBackButton()]
      })

      const provider = TestBed.inject(NgxBackButtonServiceProvider)
      expect(provider).toEqual({})
    })

    it('should provide NgxBackButtonServiceProvider with partial config', () => {
      const config = { rootUrl: '/home' }
      
      TestBed.configureTestingModule({
        providers: [provideNgxBackButton(config)]
      })

      const provider = TestBed.inject(NgxBackButtonServiceProvider)
      expect(provider).toEqual({ rootUrl: '/home' })
    })
  })

  describe('provideNgxBackButtonChild', () => {
    it('should provide NgxBackButtonServiceProvider with child config', () => {
      const config = { rootUrl: '/login', fallbackPrefix: '/child' }
      
      TestBed.configureTestingModule({
        providers: [provideNgxBackButtonChild(config)]
      })

      const provider = TestBed.inject(NgxBackButtonServiceProvider)
      expect(provider).toEqual(config)
    })

    it('should provide NgxBackButtonServiceProvider with empty child config', () => {
      TestBed.configureTestingModule({
        providers: [provideNgxBackButtonChild()]
      })

      const provider = TestBed.inject(NgxBackButtonServiceProvider)
      expect(provider).toEqual({})
    })

    it('should override root config when both are provided', () => {
      const rootConfig = { rootUrl: '/home', fallbackPrefix: '/app' }
      const childConfig = { rootUrl: '/login' }
      
      TestBed.configureTestingModule({
        providers: [
          provideNgxBackButton(rootConfig)
        ]
      })

      // Create a child injector with child config
      const childInjector = TestBed.inject(NgxBackButtonServiceProvider)
      expect(childInjector).toEqual(rootConfig)

      // Reset and test with child config
      TestBed.resetTestingModule()
      TestBed.configureTestingModule({
        providers: [
          provideNgxBackButtonChild(childConfig)
        ]
      })

      const provider = TestBed.inject(NgxBackButtonServiceProvider)
      expect(provider).toEqual(childConfig)
    })
  })
})
