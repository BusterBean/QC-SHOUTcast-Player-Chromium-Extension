let audio;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ playing: false, volume: 0.32, songTitle: '' });
}); // Default = 0.32

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({ playing: false });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'play') {
    chrome.storage.local.get('volume', (result) => {
      if (!audio) {
        audio = new Audio('https://radio.queercraft.net:443/stream/;'); // Station URL
        audio.volume = result.volume; // Set initial volume from storage
      }
      audio.play().then(() => {
        chrome.storage.local.set({ playing: true });
        chrome.browserAction.setIcon({
          path: {
            "16": "icons/icon16_playing.png",
            "32": "icons/icon32_playing.png",
            "48": "icons/icon48_playing.png",
            "64": "icons/icon64_playing.png",
            "128": "icons/icon128_playing.png"
          }
        });
        sendResponse({ success: true });
      }).catch(error => {
        console.error("Error playing audio:", error);
        sendResponse({ success: false, error: error.message });
      });
    });
  } else if (message.action === 'stop') {
    if (audio) {
      audio.pause();
      audio.src = ''; // Reset the audio source to stop the stream
      audio = null; // Clear the audio object
      chrome.storage.local.set({ playing: false });
      chrome.browserAction.setIcon({
        path: {
          "16": "icons/icon16.png",
          "32": "icons/icon32.png",
          "48": "icons/icon48.png",
          "64": "icons/icon64.png",
          "128": "icons/icon128.png"
        }
      });
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: "No audio to stop" });
    }
  } else if (message.action === 'setVolume') {
    if (audio) {
      audio.volume = message.volume;
    }
    chrome.storage.local.set({ volume: message.volume }); // Store volume in storage
    sendResponse({ success: true });
  }
  return true; // Ensure sendResponse is valid asynchronously
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.playing) {
    if (!changes.playing.newValue && audio) {
      audio.pause();
    }
  }
});
