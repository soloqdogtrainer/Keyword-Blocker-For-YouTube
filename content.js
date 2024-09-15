// Ensure keywords are declared only once
if (typeof keywords === 'undefined') {
  var keywords = [];
}

// Fetch initial keywords and hide videos
chrome.storage.sync.get({ keywords: [] }, (data) => {
  keywords = data.keywords;
  hideVideos();
});

// Listen for storage changes and update keywords
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.keywords) {
    keywords = changes.keywords.newValue || [];
    hideVideos();
  }
});

// Function to hide videos
function hideVideos() {
  const videoElements = document.querySelectorAll("ytd-rich-item-renderer");

  videoElements.forEach((videoElement) => {
    const titleElement = videoElement.querySelector("#video-title");
    if (titleElement) {
      const videoTitle = titleElement.textContent.trim().toLowerCase();
      if (containsAnyKeyword(videoTitle, keywords)) {
        videoElement.style.display = "none";
      } else {
        videoElement.style.display = ""; // Ensure videos that don't match are shown
      }
    }
  });
}

// Function to check if a string contains any of the keywords
function containsAnyKeyword(str, keywords) {
  return keywords.some((keyword) => str.includes(keyword));
}

// Observe for new video additions
if (typeof observer === 'undefined') {
  const observer = new MutationObserver((mutations) => {
    let shouldHideVideos = false;

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.matches("ytd-rich-item-renderer")) {
          const titleElement = node.querySelector("#video-title");
          if (titleElement) {
            const videoTitle = titleElement.textContent.trim().toLowerCase();
            if (containsAnyKeyword(videoTitle, keywords)) {
              node.style.display = "none";
              shouldHideVideos = true;
            }
          }
        }
      });
    });

    if (shouldHideVideos) {
      hideVideos();
    }
  });

  const grid = document.querySelector('ytd-rich-grid-renderer');
  if (grid) {
    observer.observe(grid, { childList: true, subtree: true });
  }
}
