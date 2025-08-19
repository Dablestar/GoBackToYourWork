var filePath = "./banList.txt";
var currentBackground;

async function getCurrentTab(){
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
}
function isBackgroundInList(URL){
    var result = false;
    getBanList()
    .then(banList => {
        for(var i=0; i<banList.length; i++){
            if(banList[i] == URL){
                sendSkipMsg();
                result = true;
            }
        }
    });
    if(!result){
        console.log("No skip");
    }
}

function getBanList(){
    // var isInsideList = fetch(filePath)
    // .then(result => result.text())
    // .then(text => {
    //     var lines = text.split('\r\n'); 
    //     return lines
    // });
    // return isInsideList;
    return new Promise((resolve) => {
        chrome.storage.local.get('banList', function(data) {
            console.log("get data: " + data.banList);
            var banListText = data.banList.split("\r\n");
            console.log(banListText);
            resolve(banListText);
        });
    })
    // .then(result => result.text())
    // .then(text => {
    //     var lines = text.split('\r\n');
    //     return lines;
    // });
    // return banList;
}

function sendSkipMsg(){
    console.log("sendSkipMsg()");
    getCurrentTab().then(response => {
        chrome.tabs.sendMessage(response, {action : "skip"});
    });
}

// chrome.scripting
//   .registerContentScripts([{
//     id: "session-script",
//     js: ["content.js"],
//     persistAcrossSessions: false,
//     matches: ["*://youtube.com/*"],
//     runAt: "document_end",
//   }])
//   .then(() => console.log("registration complete"))
//   .catch((err) => console.warn("unexpected error", err));

// console.log("test");


// Recieve message from popup.js&contents.js
// 
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status === 'complete'){
        chrome.scripting.executeScript({
            target: {tabId : tab.id},
            files: ["./js/content.js"]
        })
        chrome.tabs.sendMessage(tabId, { action: "getURL" }, (response) => {
                if (response) {
                    currentBackground = response;
                    console.log("getURL message sent");
                    console.log(response);
                    isBackgroundInList(currentBackground);
                }
        });
    }
  });

  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({banList : ""}, function(){
        console.log("Added Successfully");
    })
  })