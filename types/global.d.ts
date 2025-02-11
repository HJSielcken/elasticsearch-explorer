interface Window {
  dataLayer: Array<Object>
}

declare module React {
  interface CSSProperties {
    '--index'?: string | number
    '--aspect-ratio'?: string | number
    '--offset-submenu'?: string | number
    '--submenu-background-scaleY'?: string | number
    '--z-index'?: string | number
    '--delay'?: string | number
    '--total-delay'?: string | number
    '--container-width'?: string | number
    '--container-height'?: string | number
    '--min-height-card'?: string | number
  }
}

declare module '*.po'
declare module '*.css'

declare module '*.woff2'

declare module '*.jpg'
declare module '*.jpeg'
declare module '*.png'
declare module '*?universal'

declare module '@sielcken/esbuild/javascript' {
  const javascript
  export { javascript }
}

declare module '@sielcken/esbuild/stylesheet' {
  const stylesheet
  export { stylesheet }
}

interface Navigator {
  webkitConnection?: NavigatorNetworkInformation
  mozConnection?: NavigatorNetworkInformation
  connection?: NavigatorNetworkInformation
}

declare interface NavigatorNetworkInformation {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g' | 'slow-4g' | 'unknown',
  saveData?: boolean
}
