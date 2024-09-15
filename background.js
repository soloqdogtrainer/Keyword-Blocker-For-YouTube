chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;
  chrome.tabs.get(tabId, (tab) => {
    if (tab.url?.startsWith("https://www.youtube.com/feed/subscriptions")) {
      chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: true },
        files: ['content.js']
      });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.startsWith("https://www.youtube.com/feed/subscriptions")) {
    chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      files: ['content.js']
    });
  }
});
