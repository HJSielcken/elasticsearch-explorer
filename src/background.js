chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  console.log({ request })
  if (request.action === 'getData') {
    const data = { aap: 'noot' } // Assume this is an async function
    sendResponse({ success: true, data });
  }
  return true;
});
