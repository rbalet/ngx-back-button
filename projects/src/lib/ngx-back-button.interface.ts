export interface NgxBackButtonServiceConfig {
  rootUrl?: string // Default Fallback in case we do not have any navigation history
  fallbackPrefix?: string // Always added in case of a Fallback (Useful when used within other libraries)
}
