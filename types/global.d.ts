interface Window {
  dataLayer: Array<Object>
}


declare module '*.po'
declare module '*.css'

declare module '*.woff2'

declare module '*.jpg'
declare module '*.jpeg'
declare module '*.png'
declare module '*?universal'

declare module '@kaliber/esbuild/javascript' {
  const javascript
  export { javascript }
}

declare module '@kaliber/esbuild/stylesheet' {
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
