export const apiUrls = {
  mapping: ({ index }) => `http://localhost:9200/${index}`,
  indices: () => 'http://localhost:9200/_cat/indices',
  search: ({ index }) => `http://localhost:9200/${index}/_search`,
  document: ({ index, id }) => `http://localhost:9200/${index}/_doc/${id}`,
  update: ({ index, id }) => `http://localhost:9200/${index}/_update/${id}`,
  delete: ({ index, id }) => `http://localhost:9200/${index}/_doc/${id}`,
  create: ({ index, id }) => `http://localhost:9200/${index}/_doc/${id}`,
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

export function sendMessage() {
  console.log(chrome)

  chrome.runtime.sendMessage({ action: 'getData', data: 'example' },
    function (response) {
      console.log('Response from background script:', response);
    }
  )
}
