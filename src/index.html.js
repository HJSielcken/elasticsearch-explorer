import { stylesheet } from '@sielcken/esbuild/stylesheet'
import { javascript } from '@sielcken/esbuild/javascript'

import App from './App?universal'

import './reset.entry.css'

export default (
  <html>
    <head>
      {stylesheet}
      {javascript}
      <title>
        ElasticSearch
      </title>
    </head>

    <body>
      <App />
    </body>
  </html>
)
