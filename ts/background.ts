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

//function timeCheck ->

// Get today's date, epoch time of 00:00
function GetTodayMidnightEpoch():number{
    var now = new Date();
    now.setHours(0, 0, 0, 0)
    return now.getTime();
}

// Get current epoch time
function GetEpochTimeHours(epochTime:number):number{
    return epochTime - GetTodayMidnightEpoch();
}

// Compare currentTime with the website's startTime and endTime
function CheckTime(currentTime:Time):boolean{
    return true;
}

// Check if currentURL matches any URL in the website database
function URLMatch(currentURL:string):boolean{
    

    return true;
}

//Add website on chrome storage
function AddWebsite(website:Website):void{

}

// Delete website on chrome storage
function DeleteWebsite(website:Website):void{

}