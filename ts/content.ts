console.log("Content Script Online");
  
function updateVariables() {
  currentURL = getCurrentBackgroundURL();
  skipBtn = getSkipButton();
  console.log("Variables updated:", { currentURL, skipBtn });
}
  
  function getCurrentBackgroundURL(){
    let URL = document.querySelector("#pivot-button > pivot-button-view-model > a").getAttribute("href");
    console.log(URL);
    return URL;
  }
  
  function getSkipButton(){
    let button = document.querySelector('#navigation-button-down > ytd-button-renderer');
    console.log(button);
    return button; 
  }
  
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'skip') {
      if (skipBtn) {
        skipBtn.click();
        console.log('Webpage button was clicked!');
      } else {
        console.log('Webpage button not found');
      }
    }
    if(request.action === 'getURL'){
      console.log("getURL received");
      sendResponse(currentURL);
    }
  });
  
  updateVariables();

  document.addEventListener("load", function(){
    setTimeout(5000);
    console.log("loaded");
    updateVariables();
  });