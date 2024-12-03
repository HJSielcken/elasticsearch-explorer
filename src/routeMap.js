import { asRouteMap } from '@kaliber/routing'

export const routeMap = asRouteMap({
  app: {
    path: '',
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
