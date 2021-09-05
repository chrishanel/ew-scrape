

var scrapeButton = document.getElementById('scrapeEpisode');

scrapeButton.addEventListener("click", async () => {
    console.log("button clicked");
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {command: "init"}, function(response) {
                    console.log(response.result);
                });
    });
});
