var filePath = "./banList.txt";
var backgroundURL;
let banList;

async function getCurrentTab(){
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
}

function addBackgroundOnBanList(URL, id){
    console.log("addBackgroundOnBanList()");
    console.log("tabId : " + id);
    console.log(URL);
    chrome.storage.local.get('banList', function(data){
            banList = data.banList;
            console.log(banList);
            var newBanList = banList.concat(URL + '\r\n');
            chrome.storage.local.set({banList : newBanList}, function(){
                console.log("Added Successfully");
            })
    });
    
}

document.getElementById("addBtn").addEventListener("click", function() {
    console.log("btnClicked");
    getCurrentTab().then(response => {
        chrome.scripting.executeScript({
            target: { tabId: response },
            files: ["./js/content.js"]
        }).then(() => {
            // Use a single message to get the URL and then proceed
            chrome.tabs.sendMessage(response, { action: "getURL" }, (url) => {
                backgroundURL = url;
                addBackgroundOnBanList(backgroundURL, response);
                // After adding URL to ban list, send the skip action
                chrome.tabs.sendMessage(response, { action: "skip" });
            });
        });
    });
    // chrome.runtime.sendMessage({action:"requestURL"}, function(response){
    //     console.log(response);
    //     backgroundURL = response;
    //     console.log(backgroundURL);
    // });

});
    




