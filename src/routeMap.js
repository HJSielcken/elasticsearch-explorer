import { asRouteMap } from '@kaliber/routing'

export const routeMap = asRouteMap({
  home: {
    path: ''
  },
  app: {
    path: 'index.html',
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
  },

  notFound: {
    path: '*'
  },
})
