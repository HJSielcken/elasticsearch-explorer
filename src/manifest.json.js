export default process.env.BROWSER === 'firefox' ? ({
  "manifest_version": 3,
  "name": "Elasticsearch Explorer",
  "version": "1.0",
  "description": "Elasticsearch Explorer",
  "action": {},
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
  "version": "1.0",
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
