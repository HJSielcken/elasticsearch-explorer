export const apiUrls = {
  indices: () => 'http://localhost:9200/_cat/indices',
  document: {
    get: ({ index, id }) => `http://localhost:9200/${index}/_doc/${id}`,
    update: ({ index, id }) => `http://localhost:9200/${index}/_update/${id}`,
    delete: ({ index, id }) => `http://localhost:9200/${index}/_doc/${id}`,
    create: ({ index, id }) => `http://localhost:9200/${index}/_doc/${id}`,
  },
  index: {
    mapping: ({ index }) => `http://localhost:9200/${index}`,
    search: ({ index }) => `http://localhost:9200/${index}/_search`,
    deleteByQuery: ({ index }) => `http://localhost:9200/${index}/_delete_by_query`,
    delete: ({ index }) => `http://localhost:9200/${index}/`,
  }
}

export async function apiCall(url, { method = 'GET', body = undefined } = {}) {
  return fetch(url, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }).then(x => x.json())
}
