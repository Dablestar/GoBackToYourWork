/// <reference types="chrome"/>

//Website -> URL, startTime, endTime
export type Website = {
    url: string;
    startTime: Time;
    endTime: Time;
}
export type Time = {epochTime: number}

var url:string = window.location.href;

//onURLCheck -> check URL, compare url database, if exists and time matches, block access
//onInstall -> add Youtube

// Get today's date, epoch time of 00:00
function GetTodayMidnightEpoch():number{
    var now = new Date();
    now.setHours(0, 0, 0, 0)
    return now.getTime();
}

// Get current epoch time
function GetEpochTimeHMS(epochTime:number):number{
    return epochTime - GetTodayMidnightEpoch();
}

// Compare currentTime with the website's startTime and endTime
function CheckTime(currentTime:Time):boolean{
    var currentEpoch = GetEpochTimeHMS(currentTime.epochTime);
    var startEpoch = GetEpochTimeHMS(currentTime.epochTime);
    var endEpoch = GetEpochTimeHMS(currentTime.epochTime);
    return currentEpoch >= startEpoch && currentEpoch <= endEpoch;
}

// Check if currentURL matches any URL in the website database
function URLMatch(currentURL:string):boolean{
    chrome.storage.local.get(null, (items) => {
        for (const [key, value] of Object.entries(items)) {
            if (key === currentURL) {
                // If a matching URL is found, check the time
                return true
            }
        }
    });
    return false;
}

//Add website on declarativeNetRequest Ruleset
export function AddWebsite(website:Website):void{
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
        let ruleCount = rules.length;
        chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
            {
                id: ruleCount++,
                priority: 1,
                action: {
                    type: "block"
                },
                condition: {
                    urlFilter: website.url,
                    resourceTypes: ["main_frame"]
                }
            }
        ]
    });
    });
    chrome.storage.local.set({ type:"blockedWebsite", url: website.url, startTime: website.startTime, endTime: website.endTime }, () => {
        console.log(`Website ${website.url} added to storage`);
    });
}

// Delete website on chrome storage
export function DeleteWebsite(website:Website):void{
    chrome.storage.local.remove([website.url], () => {
        console.log(`Website ${website.url} removed from storage`);
    });
}

//Test - xvideos, youtube
chrome.runtime.onInstalled.addListener(() => {
    const testWebsite: Website = {
        url: "https://www.xvideos.com/",
        startTime: { epochTime: Date.now() },
        endTime: { epochTime: Date.now() + 3600 * 1000 }
    };
    AddWebsite(testWebsite);
});


// Clear storage and 
chrome.management.onUninstalled.addListener(extensionId => {
    chrome.storage.local.get(blockedWebsites => {
        const websitesToDelete = Object.keys(blockedWebsites).filter(key => blockedWebsites[key].type === "blockedWebsite");
        if (websitesToDelete.length > 0) {
            chrome.storage.local.remove(websitesToDelete, () => {
                console.log(`Removed ${websitesToDelete.length} blocked websites from storage.`);
            });
        }
    });
});