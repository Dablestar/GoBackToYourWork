/// <reference types="chrome"/>


//Website -> URL, startTime, endTime
export type Website = {
    url: string;
    startTime: Time;
    endTime: Time;
}
export type Time = {epochTime: number}

console.log("Background script running");
var url: string = "" 
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
        url = tabs[0].url ?? "<unknown>";
    }
});

console.log("Current URL: " + url);

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
function CheckTime(website:Website):boolean{
    console.log(`CheckTime(${website.url})`);
    var currentEpoch = GetEpochTimeHMS(Date.now());
    var startEpoch = GetEpochTimeHMS(website.startTime.epochTime);
    var endEpoch = GetEpochTimeHMS(website.endTime.epochTime);
    return currentEpoch >= startEpoch && currentEpoch <= endEpoch;
}

// Check if currentURL matches any URL in the website database
function URLMatch(currentURL:string):boolean{
    console.log(`URLMatch(${currentURL})`);
    chrome.storage.local.get("blockedWebsites", (items) => {
        for (const [key, value] of Object.entries(items)) {
            if (value.url === currentURL) {
                return true
            }
        }
    });
    return false;
}

//Add website on declarativeNetRequest Ruleset
export function AddWebsite(website:Website):void{
    console.log(`AddWebsite(${website.url})`);
    chrome.storage.local.set({ type:"blockedWebsite", url: website.url, startTime: website.startTime, endTime: website.endTime }, () => {
        console.log(`Website ${website.url} added to storage`);
    });
}

// Delete website on chrome storage and declarativeNetRequest
export function DeleteWebsite(website:Website):void{
    console.log(`DeleteWebsite(${website.url})`);
    chrome.storage.local.remove([website.url], () => {
        console.log(`Website ${website.url} removed from storage`);
    });
}

function EnableBlock(website: Website): void {
    console.log(`EnableBlock(${website.url})`);
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
        let ruleCount = rules.length;
        chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
            {
                id: ruleCount++,
                priority: 1,
                action: {
                    type: "redirect",
                    redirect: {
                        url: "./redirect.html"
                    }
                },
                condition: {
                    urlFilter: website.url,
                    resourceTypes: ["main_frame"]
                }
            }
        ]
    });
    });
}

function DisableBlock(website: Website): void {
    console.log(`DisableBlock(${website.url})`);
    chrome.declarativeNetRequest.getDynamicRules((rules) => {
        const ruleIdsToRemove = rules
            .filter(rule => rule.condition.urlFilter === website.url)
            .map(rule => rule.id);
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: ruleIdsToRemove
        });
    });
}

//Test - xvideos, youtube
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed");
    const testWebsite: Website = {
        url: "https://www.youtube.com/",
        startTime: { epochTime: Date.now() },
        endTime: { epochTime: Date.now() + 3600 * 1000 }
    };
    AddWebsite(testWebsite);
});


// Clear storage
chrome.management.onUninstalled.addListener(extensionId => {
    chrome.storage.local.get("type", (blockedWebsites) => {
        const websitesToDelete = Object.keys(blockedWebsites).filter(key => blockedWebsites[key].type === "blockedWebsite");
        if (websitesToDelete.length > 0) {
            chrome.storage.local.remove(websitesToDelete, () => {
                console.log(`Removed ${websitesToDelete.length} blocked websites from storage.`);
            });
        }
    });
});

chrome.tabs.onUpdated.addListener(() => {
    console.log(`Tab updated, checking URL... ${url}`);

    const testWebsite: Website = {
        url: "https://www.youtube.com/",
        startTime: { epochTime: Date.now() },
        endTime: { epochTime: Date.now() + 3600 * 1000 }
    };
    AddWebsite(testWebsite);
    DeleteWebsite(testWebsite);

    if(URLMatch(url)){
        chrome.storage.local.get("type", (blockedWebsites) => {
            // Check if the current URL is in the blocked websites
            if (blockedWebsites[url]) {
                // If it is, check the time
                if (CheckTime(blockedWebsites[url])) {
                    EnableBlock(blockedWebsites[url]);
                } else {
                    DisableBlock(blockedWebsites[url]);
                }
            }
        });
    }
});
    