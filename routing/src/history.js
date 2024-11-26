// copied from https://github.com/reach/router/blob/master/src/lib/history.js
import { createMemoryHistory } from 'history'

const hi = createMemoryHistory()
// console.log({ hi })
// const hi = window.history

getHistory.singleton = null
export function getHistory() {
  if (getHistory.singleton) return getHistory.singleton

  let listeners = []
  let location = getLocation()

  return getHistory.singleton = {
    get location() { return location },

    listen(listener) {
      listeners.push(listener)

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
        listeners = listeners.filter(fn => fn !== listener)
      }

      function handlePopState() {
        location = getLocation()
        console.log({ location })
        listener({ location, action: 'POP' })
      }
    },

    navigate(to, { state = undefined, replace = false } = {}) {
      console.log({ to })
      if (typeof to === 'number') hi.go(to)
      else {
        state = { ...state, key: Date.now() + '' }
        // try...catch iOS Safari limits to 100 pushState calls
        try {
          if (replace) {
            console.log('replace')
            console.log({ state })
            hi.replace(to, state)
          }
          else {
            console.log('push')
            console.log({ state })

            hi.push(to, state)
          }
        } catch (e) {
          console.log({ e })
          hi.location[replace ? 'replace' : 'assign'](to)
        }
      }

      location = getLocation()
      listeners.forEach(listener => listener({ location, action: 'PUSH' }))
    }
  }
}


function getLocation() {
  const {
    search,
    hash,
    href,
    origin,
    protocol,
    host,
    hostname,
    port,
  } = hi.location || {}
  console.log({ location: hi.location })
  let { pathname } = hi.location || {}
  console.log({ pathname })
  // if (!pathname && href) {
  //   const url = new URL(href)
  //   pathname = url.pathname
  // }

  return {
    pathname: encodeURI(decodeURI(pathname)),
    search,
    hash,
    href,
    origin,
    protocol,
    host,
    hostname,
    port,
    state: hi.state,
    key: (hi.state && hi.state.key) || 'initial'
  }
}
