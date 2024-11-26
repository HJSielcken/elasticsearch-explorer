import { asRouteMap } from '@kaliber/routing'

export const routeMap = asRouteMap({
  home: {
    path: ''
  },
  index: {
    path: 'index',
    overview: {
      path: '',
    },
    documents: {
      path: ':index',
      document: {
        path: ':id'
      }
    }
  }
})
