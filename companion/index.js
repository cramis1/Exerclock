import * as messaging from "messaging";
import { encode } from 'cbor';
import { settingsStorage } from "settings";
import { me } from "companion";
import "fitbit-google-analytics/companion"

var BGError = false;
var timeSelect = false;

//--------------------------
//    Other Variables
//--------------------------


var bgDataUnits = "mg/dl";
var bgHighLevel = 0;
var bgLowLevel = 0;
var bgTargetTop = 0;
var bgTargetBottom = 0;
var bgTrend = "Flat";
var points = [220,220,220,220,220,220,220,220,220,220,220,220];
var pointsPop = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];
var currentTimestamp = Math.round(new Date().getTime()/1000);
var lastTimestamp = 0;
var latestDelta = 0;
var disableAlert;
var snoozeLength;
var weatherUnitF;
var dataUrl = "http://127.0.0.1:17580/sgv.json?count=12";
var dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
var settingsUrl = "http://127.0.0.1:17580/status.json";
var manualHighLow;
var BGUnitSelect;
var snoozeRemove;
var dataSource;
var presenceAlert;

//----------------end other variables

var ExerciseSelection = "run";

if(getSettings('ExerciseSelect')){
ExerciseSelection = getSettings('ExerciseSelect').values[0].name;
}

if(getSettings( 'snoozeRemove' )) {
    snoozeRemove = getSettings('snoozeRemove');
    //console.log("manual high low: " + manualHighLow)
  } else {
    snoozeRemove = false;
  }


if(getSettings( 'timeSelect' )) {
    timeSelect = getSettings('timeSelect');
    //console.log("manual high low: " + manualHighLow)
  } else {
    timeSelect = false;
  }
 
if(getSettings('disableAlert')) {
    disableAlert = getSettings('disableAlert');
   // console.log("disableAlert on settings change: " + disableAlert)
  } else {
    disableAlert = false;
  }
  
  if(getSettings('snoozeLength')){ //&& (getSettings('settingsSourceURL').name.includes('http'))) {
    snoozeLength = getSettings('snoozeLength');
  } else {
    snoozeLength = 15;
  }
  
  
if(getSettings('SourceSelect')){
dataSource = getSettings('SourceSelect').values[0].name;
}

if (dataSource === 'xdrip'){
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
} else if (dataSource === 'spike'){
  dataUrl = "http://127.0.0.1:1979/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:1979/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:1979/status.json";
} else if (dataSource === 'nightscout') {
 
  if(getSettings('NightSourceURL')){ //&& (getSettings('dataSourceURL').name.includes('http'))) {
    var NightURL = getSettings('NightSourceURL').name;
    var lastChar = NightURL.substr(-1);
      if (lastChar !== '/') {       
        dataUrl = NightURL + "/api/v1/entries/sgv.json?count=12";
        dataUrlPop = NightURL + "/api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "/api/v1/status.json";
      } else{
        dataUrl = NightURL + "api/v1/entries/sgv.json?count=12";
        dataUrlPop = NightURL + "api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "api/v1/status.json";
      }
  } 
} else {
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
}
 /* if(getSettings('settingsSourceURL')){ //&& (getSettings('settingsSourceURL').name.includes('http'))) {
    settingsUrl = getSettings('settingsSourceURL').name;
  } else {
    settingsUrl = "http://127.0.0.1:17580/status.json";
  }
*/
if(getSettings( 'viewSettingSelect' )) {
    manualHighLow = getSettings('viewSettingSelect');
    //console.log("manual high low: " + manualHighLow)
  } else {
    manualHighLow = false;
  }

if (manualHighLow === true){
 // console.log("manual high low: " + manualHighLow )
     if(getSettings( 'BGUnitSelect' )) {
        bgDataUnits = getSettings('BGUnitSelect').values[0].name;
        //console.log("bg settings unit: " + bgDataUnits)
      } else {
        bgDataUnits = "mmol";
      }
    
     if (bgDataUnits === "mmol") {
      
       if(getSettings("highThresholdIn")){
         let bgHighLeveltemp = getSettings("highThresholdIn").name;  
         bgHighLevel =  Math.round(bgHighLeveltemp * 18.018);
       //  console.log("bg high level: " + bgHighLevel )
          } else {
            bgHighLevel = 164
          }
       
       if(getSettings("lowThresholdIn")){
           let bgLowLeveltemp = getSettings("lowThresholdIn").name;
         bgLowLevel = Math.round(bgLowLeveltemp * 18.018);
       // console.log("bg low level: " + bgLowLevel )
          } else {
           bgLowLevel = 72
          }
      
      }  else{
    
        if(getSettings("highThresholdIn")){
            bgHighLevel = getSettings("highThresholdIn").name
          } else {
            bgHighLevel = 164
          }

          if(getSettings("lowThresholdIn")){
           bgLowLevel = getSettings("lowThresholdIn").name
          } else {
           bgLowLevel = 72
          }

      } 
   // console.log("manual high: " + bgHighLevel + " low:" + bgLowLevel + " unit:" + bgDataUnits)
  }
//console.log("dataURL: " + dataUrl,
              //"   settingsURL: " + settingsUrl);
        


//----------------------------------------------------------
//
// Fetch location
//
//----------------------------------------------------------


//----------------------------------------------------------
//
// Aquire BG
//
//----------------------------------------------------------
function queryBGD () {
  
  //console.log("fetch BG- dataUrl:" + dataUrl)
  
  fetch(dataUrl,{
      method: 'GET',
      mode: 'cors',
      headers: new Headers({
        "Content-Type": 'application/json; charset=utf-8'
      })
    })
  .then(response => {
       response.text().then(data => {
          //console.log('fetched Data from API');
          //let obj = JSON.parse(data);
          let returnval = buildGraphData(data);
          BGError = false;
        })
        .catch(responseParsingError => {
          console.log("Response parsing error in data!");
          console.log(responseParsingError.name);
          console.log(responseParsingError.message);
          console.log(responseParsingError.toString());
          console.log(responseParsingError.stack);
          BGError = true;
        });
      }).catch(fetchError => {
        console.log("Fetch Error in data!");
        console.log(fetchError.name);
        console.log(fetchError.message);
        console.log(fetchError.toString());
        console.log(fetchError.stack);
        BGError = true;
})
  return true;
};

function queryBGDPop () {
 //console.log("companion queryBGDPop")  
  //console.log("fetch BG- dataUrl:" + dataUrl)
  
  fetch(dataUrlPop,{
      method: 'GET',
      mode: 'cors',
      headers: new Headers({
        "Content-Type": 'application/json; charset=utf-8'
      })
    })
  .then(response => {
       response.text().then(data => {
         // console.log('fetched Graph Data from API');
          //let obj = JSON.parse(data);
          let returnval = buildGraphDataPop(data);
          BGError = false;
        })
        .catch(responseParsingError => {
          console.log("Response parsing error in data!");
          console.log(responseParsingError.name);
          console.log(responseParsingError.message);
          console.log(responseParsingError.toString());
          console.log(responseParsingError.stack);
          BGError = true;
        });
      }).catch(fetchError => {
        console.log("Fetch Error in data!");
        console.log(fetchError.name);
        console.log(fetchError.message);
        console.log(fetchError.toString());
        console.log(fetchError.stack);
        BGError = true;
})
  return true;
};
function buildGraphDataPop(data) {
 // console.log("companion buildGraphDataPop") 
  let obj = JSON.parse(data);
  let graphpointindex = 0;
  var runningTimestamp = new Date().getTime();
  var indexarray = [];

  let index = 0;
  let validTimeStamp = false;
//  console.log(JSON.stringify(obj));
  for (graphpointindex = 0; graphpointindex < 41; graphpointindex++) {
    if (index < 41) {
      while (((runningTimestamp - obj[index].date) >= 305000) && (graphpointindex < 41)) {
        pointsPop[graphpointindex] = undefined;
        runningTimestamp = runningTimestamp - 300000;
        graphpointindex++;
      }
      if(graphpointindex < 41) {
        pointsPop[graphpointindex] = obj[index].sgv;
       runningTimestamp = obj[index].date;
      }
        
    }
    index++
  }
  latestDelta = obj[0].delta;
  
  //let testiob = '12.36U(0.18|0.18) -1.07 13g'//'1.50U\/h 0.36U(0.18|0.18) -1.07 0g'
  let iob;
  let cob;
  if (obj[0].IOB || obj[0].COB){
  iob = obj[0].IOB;
  cob = obj[0].COB;
  
   } else  if (obj[0].aaps){
   //https://regex101.com/r/qFDNIG/4   
   const regex = /\b(\d+\.?\d+)U\(.+\s+(\d+)g/;
    const str = obj[0].aaps;
     //const str = `137.90U(0.18|0.18) -1.07 937g`;
    let m;

    if ((m = regex.exec(str)) !== null) {
    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      //  console.log(`Found match, group ${groupIndex}: ${match}`);
    });
    }


    if (m){
     iob = m[1];
     cob = m[2];
    } 
    
  } else {
    iob = 0;
    cob = 0;
  }
   
  
  //var flippedPoints = points.reverse();
        lastTimestamp = obj[0].date;
        bgTrend = obj[0].direction;  
  
  
  const messageContent = {"bgdataPop" : {
      "sgv": pointsPop, 
      "lastPollTime": lastTimestamp, 
      "currentTrend": bgTrend,
      "delta": latestDelta,
      "BGerror": BGError,
      "iob": iob,
      "cob": cob
      }
  };
 // console.log(JSON.stringify(messageContent));
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  } else {
  //  console.log("companion - no connection");
    me.wakeInterval = 2000;
    setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
    me.wakeInterval = undefined;
  }
  return true;
}



function buildGraphData(data) {
  
  let obj = JSON.parse(data);
  let graphpointindex = 0;
  var runningTimestamp = new Date().getTime();
  var indexarray = [];

  let index = 0;
  let validTimeStamp = false;
//  console.log(JSON.stringify(obj));
  for (graphpointindex = 0; graphpointindex < 12; graphpointindex++) {
    if (index < 12) {
      while (((runningTimestamp - obj[index].date) >= 305000) && (graphpointindex < 12)) {
        points[graphpointindex] = undefined;
        runningTimestamp = runningTimestamp - 300000;
        graphpointindex++;
      }
      if(graphpointindex < 12) {
        points[graphpointindex] = obj[index].sgv;
       runningTimestamp = obj[index].date;
      }
        if (!validTimeStamp) {
        lastTimestamp = obj[index].date;
        bgTrend = obj[index].direction;
        validTimeStamp = true;
      }
    }
    index++
  }
  lastTimestamp = parseInt(lastTimestamp/1000, 10);
  latestDelta = obj[0].delta;
  
  //let testiob = '12.36U(0.18|0.18) -1.07 13g'//'1.50U\/h 0.36U(0.18|0.18) -1.07 0g'
  let iob;
  let cob;
  if (obj[0].IOB || obj[0].COB){
  iob = obj[0].IOB;
  cob = obj[0].COB;
  
   } else  if (obj[0].aaps){
   //https://regex101.com/r/qFDNIG/4   
   const regex = /\b(\d+\.?\d+)U\(.+\s+(\d+)g/;
    const str = obj[0].aaps;
     //const str = `137.90U(0.18|0.18) -1.07 937g`;
    let m;

    if ((m = regex.exec(str)) !== null) {
    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
       // console.log(`Found match, group ${groupIndex}: ${match}`);
    });
    }


    if (m){
     iob = m[1];
     cob = m[2];
    } 
    
  } else {
    iob = 0;
    cob = 0;
  }
  
  
  //var flippedPoints = points.reverse();
        lastTimestamp = obj[0].date;
        bgTrend = obj[0].direction;
      const messageContent = {"bgdata" : {
      "sgv": points, 
      "lastPollTime": lastTimestamp, 
      "currentTrend": bgTrend,
      "delta": latestDelta,
      "BGerror": BGError,
      "iob": iob,
      "cob": cob
    }
  };
 // console.log(JSON.stringify(messageContent));
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  } else {
    console.log("companion - no connection");
    me.wakeInterval = 2000;
    setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
    me.wakeInterval = undefined;
  }
  return true;
}


//----------------------------------------------------------
//
// Aquire settings
//
//----------------------------------------------------------

function settingsPoll (){
 // console.log("manualHighLow " + manualHighLow)
  if (manualHighLow === true) {
    settingsPollManual();
  } else {
    settingsPollAPI();
  }
}

function settingsPollAPI () {
       
       //console.log('get settings - settingsUrl' + settingsUrl);
    
       fetch(settingsUrl, {
        method: 'GET',
        mode: 'cors',
        headers: new Headers({
          "Content-Type": 'application/json; charset=utf-8',
        }),
      })
        .then(response => {
   //       console.log('Get Settings From Phone');
          response.text().then(statusreply => {
           // console.log("fetched settings from API");
            let returnval = buildSettings(statusreply);
          })
            .catch(responseParsingError => {
              console.log('Response parsing error in settings!');
              console.log(responseParsingError.name);
              console.log(responseParsingError.message);
              console.log(responseParsingError.toString());
              console.log(responseParsingError.stack);
            });
        }).catch(fetchError => {
          console.log('Fetch error in settings!');
          console.log(fetchError.name);
          console.log(fetchError.message);
          console.log(fetchError.toString());
          console.log(fetchError.stack);
        });
   return true;
};

function buildSettings(settings) {
  // Need to setup High line, Low Line, Units.
  var obj = JSON.parse(settings);
  
  bgHighLevel = obj.settings.thresholds.bgHigh;
  bgLowLevel = obj.settings.thresholds.bgLow;
  bgDataUnits = obj.settings.units;
 
  //bgTargetTop = obj.settings.thresholds.bgTargetTop;
  //bgTargetBottom = obj.settings.thresholds.bgTargetBottom;
  
  settingsStorage.setItem("unitsType", JSON.stringify(bgDataUnits));
  //console.log("bgDataUnits:" + bgDataUnits);
  const messageContent = {"settings": {
      "bgDataUnits" : bgDataUnits,
      "bgHighLevel" : bgHighLevel,
      "bgLowLevel" : bgLowLevel,
      "disableAlert": disableAlert,
      "snoozeLength": snoozeLength,
      "snoozeRemove": snoozeRemove,
      "ExerciseSelection": ExerciseSelection
    },
  }; // end of messageContent
 // console.log(JSON.stringify(messageContent));
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  } else {
    console.log("companion - no connection");
    me.wakeInterval = 2000;
    setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
    me.wakeInterval = undefined;
  }
  return true;
}


function settingsPollManual() {
 
  
  const messageContent = {"settings": {
      "bgDataUnits" : bgDataUnits,
      "bgHighLevel" : bgHighLevel,
      "bgLowLevel" : bgLowLevel,
      "disableAlert": disableAlert,
      "snoozeLength": snoozeLength,
      "snoozeRemove": snoozeRemove,
      "ExerciseSelection": ExerciseSelection
    },
  }; // end of messageContent
 // console.log(JSON.stringify(messageContent));
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(messageContent);
  } else {
    console.log("companion - no connection");
    //me.wakeInterval = 2000;
    setTimeout(function(){messaging.peerSocket.send(messageContent);}, 2500);
    //me.wakeInterval = undefined;
  }
  return true;
  
}


settingsStorage.onchange = function(evt) {
  
  if(getSettings( 'snoozeRemove' )) {
    snoozeRemove = getSettings('snoozeRemove');
    //console.log("manual high low: " + manualHighLow)
  } else {
    snoozeRemove = false;
  }
  

 if(getSettings('SourceSelect')){
dataSource = getSettings('SourceSelect').values[0].name;
}

if (dataSource === 'xdrip'){
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
} else if (dataSource === 'spike'){
  dataUrl = "http://127.0.0.1:1979/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:1979/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:1979/status.json";
} else if (dataSource === 'nightscout') {
 
  if(getSettings('NightSourceURL')){ //&& (getSettings('dataSourceURL').name.includes('http'))) {
    var NightURL = getSettings('NightSourceURL').name;
    var lastChar = NightURL.substr(-1);
      if (lastChar !== '/') {       
        dataUrl = NightURL + "/api/v1/entries/sgv.json?count=12";
        dataUrlPop = NightURL + "/api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "/api/v1/status.json";
      } else{
        dataUrl = NightURL + "api/v1/entries/sgv.json?count=12";
        dataUrlPop = NightURL + "api/v1/entries/sgv.json?count=41";
        settingsUrl = NightURL + "api/v1/status.json";
      }
  } 
} else {
  dataUrl = "http://127.0.0.1:17580/sgv.json?count=12";
  dataUrlPop = "http://127.0.0.1:17580/sgv.json?count=41";
  settingsUrl = "http://127.0.0.1:17580/status.json";
}
  
  
  if(getSettings('disableAlert')) {
    disableAlert = getSettings('disableAlert');
   // console.log("disableAlert on settings change: " + disableAlert)
  } else {
    disableAlert = false;
  }
  
  if(getSettings('snoozeLength')){ //&& (getSettings('settingsSourceURL').name.includes('http'))) {
    snoozeLength = getSettings('snoozeLength');
  } else {
    snoozeLength = 15;
  }
  
  if(getSettings('selection')){ //&& (getSettings('settingsSourceURL').name.includes('http'))) {
    weatherUnitF = getSettings('selection').values[0].name;
  } else {
    weatherUnitF = "celsius";
  }
  //console.log("temp setting: " + weatherUnitF);
  
 if(getSettings( 'viewSettingSelect' )) {
    manualHighLow = getSettings('viewSettingSelect');
    //console.log("manual high low: " + manualHighLow)
  } else {
    manualHighLow = false;
  }
  
  if (manualHighLow === true){
  //console.log("manual high low: " + manualHighLow )
     if(getSettings( 'BGUnitSelect' )) {
        bgDataUnits = getSettings('BGUnitSelect').values[0].name;
        //console.log("bg settings unit: " + bgDataUnits)
      } else {
        bgDataUnits = "mmol";
      }
    
     if (bgDataUnits === "mmol") {
      
       if(getSettings("highThresholdIn")){
         let bgHighLeveltemp = getSettings("highThresholdIn").name;  
         bgHighLevel =  Math.round(bgHighLeveltemp * 18.018);
       //  console.log("bg high level: " + bgHighLevel )
          } else {
            bgHighLevel = 164
          }
       
       if(getSettings("lowThresholdIn")){
           let bgLowLeveltemp = getSettings("lowThresholdIn").name;
         bgLowLevel = Math.round(bgLowLeveltemp * 18.018);
      //  console.log("bg low level: " + bgLowLevel )
          } else {
           bgLowLevel = 72
          }
      
      }  else{
    
        if(getSettings("highThresholdIn")){
            bgHighLevel = getSettings("highThresholdIn").name
          } else {
            bgHighLevel = 164
          }

          if(getSettings("lowThresholdIn")){
           bgLowLevel = getSettings("lowThresholdIn").name
          } else {
           bgLowLevel = 72
          }

      } 
 //   console.log("manual high: " + bgHighLevel + " low:" + bgLowLevel + " unit:" + bgDataUnits)
  }

  if(getSettings( 'timeSelect' )) {
    timeSelect = getSettings('timeSelect');
    //console.log("manual high low: " + manualHighLow)
  } else {
    timeSelect = false;
  }
  
  if(getSettings('ExerciseSelect')){
ExerciseSelection = getSettings('ExerciseSelect').values[0].name;
}

settingsPoll();
setTimeout(queryBGD(), 500);
} 

function getSettings(key) {
  if(settingsStorage.getItem( key )) {
    return JSON.parse(settingsStorage.getItem( key ));
  } else {
    return undefined
  }
}

//----------------------------------------------------------
//
// Snooze Messaging
//
//----------------------------------------------------------


function querySnooze1(){
  fetch("http://127.0.0.1:17580/sgv.json?tasker=osnooze")
   .then(function (response) {
      
      if (response.status !== 200) {
         // console.log('Did not snooze fetch xdrip. Status Code: ' +
           // response.status);
           
          return;
        }
    
        response.json()
      .then(function(data) {
        
     //  console.log("fetched xdrip snooze: " + JSON.stringify(data));   
      });
  });
}

function querySnooze2(){
  fetch("http://127.0.0.1:1979/spikesnooze?snoozeTime=" + snoozeLength)
   .then(function (response) {
       if (response.status !== 200) {
          console.log('Did not snooze fetch spike. Status Code: ' +
            response.status);

          return;
        }
    
        response.json()
      .then(function(data) {
        
   //    console.log("fetched spike snooze: " + JSON.stringify(data));
   
      });
  });
}


//----------------------------------------------------------
//
// Messaging
//
//----------------------------------------------------------
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data.hasOwnProperty("RequestType")) {
  if (evt.data.RequestType === "Settings" ) {
     settingsPoll();
  }
  if (evt.data.RequestType === "Data" ) {
   queryBGD();
  }
  if (evt.data.RequestType === "DataPop" ) {
 //  console.log("companion received DataPop") 
    queryBGDPop();
  }
  
  if (evt.data.RequestType === "Snooze" ) {
  
    if (dataUrl.includes("17580")){
      querySnooze1();
        }
    if (dataUrl.includes("1979")){
      querySnooze2();
    }
  
  }
} 
}

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}
