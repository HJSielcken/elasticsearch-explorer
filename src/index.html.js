import { stylesheet } from '@kaliber/esbuild/stylesheet'
import { javascript } from '@kaliber/esbuild/javascript'

import App from './App.universal'

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
