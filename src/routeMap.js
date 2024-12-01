import { asRouteMap } from '@kaliber/routing'

export const routeMap = asRouteMap({

  home: {
    path: 'index.html'
  },
  home2: {
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
  },
  notFound: {
    path: '*'
  },
})
