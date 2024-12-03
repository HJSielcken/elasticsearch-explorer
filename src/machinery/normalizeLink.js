export function normalizeLink(link) {
  return link.slice(1)
}

export function toHashLink(link) {
  return `#${link.slice(1)}`
}
