// Function to update the badge text with the count of keywords
function updateBadgeText(count) {
  chrome.action.setBadgeText({ text: count.toString() });
}

// Update the badge text initially when the popup is opened
chrome.storage.sync.get("keywords", ({ keywords }) => {
  const keywordCount = keywords ? keywords.length : 0;
  updateBadgeText(keywordCount);
});

// Listen for changes in the keywords and update the badge text
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.keywords) {
    const keywordCount = changes.keywords.newValue ? changes.keywords.newValue.length : 0;
    updateBadgeText(keywordCount);
  }
});

document.getElementById("add-button").addEventListener("click", addKeyword);
document.getElementById("keyword-input").addEventListener("keypress", function(event) {
  if (event.key === 'Enter') {
    debounce(addKeyword, 300)();
  }
});

chrome.storage.sync.get("keywords", ({ keywords }) => {
  if (keywords && keywords.length > 0) {
    keywords.forEach(keyword => {
      const keywordItem = createKeywordItem(keyword);
      document.getElementById("keywords-list").appendChild(keywordItem);
    });
  }
});

// Debounced addKeyword function
const debouncedAddKeyword = debounce(addKeyword, 300);

function addKeyword() {
  const keywordInput = document.getElementById("keyword-input");
  const keywordText = keywordInput.value.trim().toLowerCase();
  const feedbackElement = document.getElementById("feedback");

  feedbackElement.textContent = ''; // Clear feedback message

  if (!keywordText) {
    return;
  }

  chrome.storage.sync.get("keywords", ({ keywords = [] }) => {
    if (keywords.includes(keywordText)) {
      showFeedback("Keyword already exists", "error");
    } else {
      keywords.push(keywordText);
      chrome.storage.sync.set({ keywords }, () => {
        const keywordItem = createKeywordItem(keywordText);
        document.getElementById("keywords-list").appendChild(keywordItem);
        keywordInput.value = "";
        showFeedback("Keyword added", "success");
      });
    }
  });
}

function createKeywordItem(keywordText) {
  const keywordItem = document.createElement("div");
  keywordItem.classList.add("keyword-item");

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "X";
  deleteButton.classList.add("delete-button");
  deleteButton.addEventListener("click", () => removeKeyword(keywordText, keywordItem));
  keywordItem.appendChild(deleteButton);

  const keywordTextElement = document.createElement("span");
  keywordTextElement.classList.add("keyword-text");
  keywordTextElement.textContent = keywordText;
  keywordItem.appendChild(keywordTextElement);

  return keywordItem;
}

function removeKeyword(keywordText, keywordItem) {
  chrome.storage.sync.get("keywords", ({ keywords = [] }) => {
    const updatedKeywords = keywords.filter(item => item !== keywordText);
    chrome.storage.sync.set({ keywords: updatedKeywords }, () => {
      keywordItem.classList.add("fade-out");
      setTimeout(() => {
        keywordItem.remove();
        showFeedback("Keyword removed", "success");
      }, 300); // Match the duration of the fade-out animation
    });
  });
}

function showFeedback(message, type) {
  const feedbackElement = document.getElementById("feedback");
  feedbackElement.textContent = message;
  feedbackElement.className = `feedback ${type}`;
  setTimeout(() => {
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
  }, 3000);
}

// Define a debounce function
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
