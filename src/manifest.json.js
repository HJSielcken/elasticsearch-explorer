export default process.env.BROWSER === 'firefox' ? ({
  "manifest_version": 3,
  "name": "Elasticsearch Explorer",
  "version": "0.2.2",
  "description": "Elasticsearch Explorer",
  "action": {},
  "browser_specific_settings": {
    "gecko": {
    "id": "harmen.sielcken@gmail.com",
    "strict_min_version": "58.0"
    }
  },
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  "background": {
    "scripts": ["background.js"]
  }
}) : ({
  "manifest_version": 3,
  "name": "Elasticsearch Explorer",
  "version": "0.2.2",
  "description": "Elasticsearch Explorer",
  "action": {},
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  "background": {
    "service_worker": "background.js"
  }
})
