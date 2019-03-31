import clock from "clock";
import document from "document";
import { vibration } from "haptics";
import * as messaging from "messaging";
import { display } from "display";
import GraphPop from "./graphPop.js"
import { memory } from "system";


//export let exerciseName = ExerciseSelection1;
//let ExerciseSelection1;


export function BGrequest () {

  const docGraphPop = document.getElementById("docGraphPop");
  const myGraphPop = new GraphPop(docGraphPop);
  const button2 = document.getElementById("button2");
  const GraphScreen= document.getElementById("GraphScreen");
    
    
  const clickGraph = document.getElementById("clickGraph");
  
  clickGraph.onclick = function(e) {
    console.log("bring up graph");
    if (  ((Date.now() - lastPollTime) > 60000) || (currentBGPop != currentBG)  ) {
         requestData("DataPop");
      } else {
     
        processBgsPop(popHolder);
      }
  graphTimeout = setTimeout(function(){ GraphScreen.style.display = "none" }, 60000);
  }
  
  button2.onclick = function () {
    console.log("close graph");
    GraphScreen.style.display = "none"; 
    clearTimeout(graphTimeout);
  }
  
//non bg variables 

let BGErrorGray1 = false;
let vibrationInterval;


const deltaDisplay = document.getElementById("delta");
const minutesSinceQuery = document.getElementById("minutes");
const bgDisplay = document.getElementById("bg");
const strikeLine = document.getElementById("strikeLine");
const avgBG = document.getElementById("avgBG");
const arrowinstance = document.getElementById("arrowinstance");
const arrowG = arrowinstance.getElementById("arrowG");
const arrowhi = document.getElementById("arrowhi");
const arrowlo = document.getElementById("arrowlo");
const arrowhiG = arrowhi.getElementById("arrowG");
const arrowloG = arrowlo.getElementById("arrowG");
const rectangleT = document.getElementById("rectangleT");
const button2 = document.getElementById("button2");

let prefBgUnits;
let prefHighLevel;
let prefLowLevel;
let points; 
let trend;
let latestDelta = 0;
var lastPollTime = Date.now();
let settingsCount = 4;
let disableAlert = false;
let snoozeLength = 15;
//let Heartratecheck;
let previousMuteBG;
let recordedBG;
let reminderTimer = 0;
var snoozeRemove = false;
let veryLowSnooze = false;
let snoozeOn = false;
let emergencyInterval;
let popHolder;
let currentBG;
let currentBGPop;
let graphTimeout;
//var presenceAlert=false;
let bodyPresent = true;
let avgBGarray = [];
let avgBGcurrent = 0;
const highPop = document.getElementById("highPop");
const midPop = document.getElementById("midPop");
const lowPop = document.getElementById("lowPop");
const topPop = document.getElementById("topPop");
const myPopup = document.getElementById("popup");
const btnLeft = myPopup.getElementById("btnLeft");
const btnRight = myPopup.getElementById("btnRight");
  let lastPopTime = 0;
  let currentBGPop;

//----------------------------------------------------------
//
// Data requests
//
//----------------------------------------------------------

var mainTimer; //= setInterval(updateBGPollingStatus, 120000);

initialCall();

function updateBGPollingStatus() {
 
      if (settingsCount === 2){   
          requestData("Settings");
          settingsCount = 0;
      } else {
          settingsCount++
        }
      
     requestData("Data");
} 

function requestData(DataType) {
  //console.log("Asking for a data update from companion.");
  var messageContent = {"RequestType" : DataType };
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(messageContent);
     // console.log("Sent request to companion.");
  } 
}


function initialCall(){
    
  clearInterval(mainTimer);
    
   
    settingsCount = 0;
    requestData("Settings");
    setTimeout(requestData("Data"), 4000);
    
  
    mainTimer = setInterval(updateBGPollingStatus, 150000);
}

//----------------------------------------------------------
//
// Settings processing
//
//----------------------------------------------------------

function updateSettings(data) {
      //console.log("Whatsettings:" + JSON.stringify(data));
      prefBgUnits = data.settings.bgDataUnits;
      prefHighLevel = data.settings.bgHighLevel;
      prefLowLevel = data.settings.bgLowLevel;
      disableAlert = data.settings.disableAlert;
      snoozeLength = data.settings.snoozeLength;
      snoozeRemove = data.settings.snoozeRemove;
      //ExerciseSelection1 = data.settings.ExerciseSelection;
      
}

//----------------------------------------------------------
//
// BG processing
//
//----------------------------------------------------------

function mmol( bg ) {
  let mmolBG2 = bg / 18.018018;
  return mmolBG2;
}

function processOneBg(data) {
 // console.log("bg data is: " + data + " prefBGunits is: " + prefBgUnits);
  
  
   recordedBG = data;
   
     // console.log("latestDelta:" + latestDelta);
     // console.log("recordedBG:" + recordedBG);
     // console.log("Trend:" + trend);
   if (isNaN(recordedBG)) {
     
   } else {  
      var sum = 0;
        avgBGarray.push(recordedBG); 
        for( var i = 0; i < avgBGarray.length; i++ ){
        sum += parseInt( avgBGarray[i], 10 ); 
        }

        avgBGcurrent = sum/avgBGarray.length;
      // console.log("avgBGcurrent: " + avgBGcurrent);
    }
        if(prefBgUnits === 'mmol') { 
            if (latestDelta > 0) {
            deltaDisplay.text = "+" + (Math.round(mmol(latestDelta)*100))/100 + " mmol";
                          
            } else{
            deltaDisplay.text = (Math.round(mmol(latestDelta)*100))/100 + " mmol";
            }
            
            avgBG.text = "average BG: " + (Math.round(mmol(avgBGcurrent)*100))/100 + " mmol";
            bgDisplay.text = (mmol(recordedBG)).toFixed(1);
          
        
        } else{
            if (latestDelta > 0) {
              deltaDisplay.text = "+" + (Math.round(latestDelta)) + " mg/dl";
            } else {
              deltaDisplay.text = (Math.round(latestDelta)) + " mg/dl";
            }
            bgDisplay.text = recordedBG;
            avgBG.text = "average BG: " + (Math.round(avgBGcurrent)) + " mg/dl";
        }
      
              
      strikeLine.style.display = "none";  
      
  setArrowDirection(trend);
}
  
  
// Event occurs when new file(s) are received
function processBgs(data) {
      points = data.bgdata.sgv;
      trend = data.bgdata.currentTrend;
      lastPollTime = data.bgdata.lastPollTime;
      latestDelta = data.bgdata.delta; 
      BGErrorGray1 = data.bgdata.BGerror;
      
      
      
      
  currentBG = points[0];
     // console.log("currentBG: " + currentBG);
       console.log("points:" + JSON.stringify(points));
      
  
 
  
  
  
  
  
  
  if(isNaN(currentBG) || BGErrorGray1 === true) {
        deltaDisplay.text = 'no data';
        setArrowDirection("Even");
        strikeLine.style.display = "inline";
        
       
      } 
  else {
        strikeLine.style.display = "none";
        colorSet(currentBG); 
        processOneBg(currentBG);
      
  
     minutesSinceQuery.text = (Math.floor(((Date.now()/1000) - (lastPollTime/1000)) /60)) + " mins";    
      
        if ((Math.floor(((Date.now()/1000) - (lastPollTime/1000)) /60)) > 999){
            minutesSinceQuery.text = "N/A";
        }
      
     // console.log(currentBG + typeof currentBG);
      //   console.log('reminder timer left: ' + (reminderTimer - Math.round(Date.now()/1000)))
  //
 
       veryLowSnooze = false; 
    
//    console.log((reminderTimer - Math.round(Date.now()/1000)) )
  //alerts
        if( (currentBG >= prefHighLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
         
          if((!disableAlert && snoozeOn===false) && bodyPresent===true) {
            
             if((previousMuteBG - currentBG) > 35){
              //  console.log('BG REALLY HIGH') ;
                    reminderTimer = (Math.round(Date.now()/1000)) - 10;
               
               if(prefBgUnits === 'mmol') {
                      startAlertProcess("nudge-max", ((Math.round(mmol(currentBG)*10))/10));
                    } else {
                      startAlertProcess("nudge-max", currentBG);
                    }
                } 
             else {
               // console.log('BG HIGH') ;
                    if(prefBgUnits === 'mmol') {
                      startAlertProcess("nudge-max", ((Math.round(mmol(currentBG)*10))/10));
                    } else {
                      startAlertProcess("nudge-max", currentBG);
                    }
              } 
          }   
        } 
         
   
        if((currentBG <= 45) && (((reminderTimer) <= Math.round(Date.now()/1000)) ) ) {
                          
               // console.log('BG VERY LOW') ;
                  if(prefBgUnits === 'mmol') {
                    let tempalertstring = "VERY LOW: " + ((Math.round(mmol(currentBG)*10))/10);
                  startAlertProcess("confirmation-max", tempalertstring);
                   } else {
                    let tempalertstring = "VERY LOW: " + currentBG;
                    startAlertProcess("confirmation-max", tempalertstring);
                   } 
                  veryLowSnooze = true;        
    
        } else if((currentBG <= prefLowLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
           
            if((!disableAlert && snoozeOn===false) && bodyPresent===true) {  
                //  console.log('BG LOW') ;
                  if(prefBgUnits === 'mmol') {
                  startAlertProcess("nudge-max", ((Math.round(mmol(currentBG)*10))/10));
                   } else {
                  startAlertProcess("nudge-max", currentBG);
                   } 
           }
        }
    
    
 
     
    if( ( (currentBG < prefHighLevel ) && (currentBG > prefLowLevel ) ) && (snoozeRemove === true) ) {
      reminderTimer = Math.round(Date.now()/1000);
      //muteIcon.style.display = "none";
      //snoozeIcon.style.display = "none";
      veryLowSnooze = false;
     // console.log("Reset snooze/mute")
    
     }
      // graph text axis
     // console.log("prefhighlevel: " + prefHighLevel + "preflowlevel: " + prefLowLevel);
  }  
}



function colorSet(currentBGcolor){
  //set the colors
      if ((currentBGcolor < prefHighLevel) && (currentBGcolor > prefLowLevel)){
        
        bgDisplay.style.fill="white"; 
        BGErrorGray1 = false;
      } 
      if (currentBGcolor <= prefLowLevel){
      
      bgDisplay.style.fill="red";
      BGErrorGray1 = false;
      } 
      if (currentBGcolor >= prefHighLevel){
       
       bgDisplay.style.fill="#FFA500";
       BGErrorGray1 = false;
       
      } 

}

function setArrowDirection(delta) {
  
  let BGWidth = bgDisplay.getBBox().width;
  let BGstart = bgDisplay.x;
  let dWidth = deltaDisplay.getBBox().width;
  let dStart = deltaDisplay.x;
  
    arrowG.style.visibility = "visible";
    arrowG.style.display = "inline";
 
  
    if ((dWidth + dStart) > (BGstart + BGWidth)){
    arrowG.x = dWidth + dStart + 3;
  } else {
  
  arrowG.x = BGstart + BGWidth + 3;
  }
  

  
  if(delta === "FortyFiveUp" ) {
    arrowG.groupTransform.rotate.angle = -45;
    arrowhi.style.display = "none";
    arrowlo.style.display = "none";
    rectangleT.style.display = "none";
  }
  else if(delta === "SingleUp" ) {
    arrowG.groupTransform.rotate.angle = -90;
    arrowhi.style.display = "none";
    arrowlo.style.display = "none";
    rectangleT.style.display = "none";
  }
  else if(delta === "DoubleUp" ) {
    arrowG.groupTransform.rotate.angle = -90;
    arrowlo.style.display = "inline";
    arrowloG.groupTransform.rotate.angle = -90;
    arrowhi.style.display = "none";
    rectangleT.style.display = "inline";
 
  }
  else if(delta === "FortyFiveDown" ) {
    arrowG.groupTransform.rotate.angle = 45;
    arrowhi.style.display = "none";
    arrowlo.style.display = "none";
    rectangleT.style.display = "none";
  }
  else if(delta === "SingleDown" ) {
    arrowG.groupTransform.rotate.angle = 90;
    arrowhi.style.display = "none";
    arrowlo.style.display = "none";
    rectangleT.style.display = "none";
  }
  else if(delta === "DoubleDown") {
    arrowG.groupTransform.rotate.angle = 90;
    arrowhi.style.display = "inline";
    arrowhiG.groupTransform.rotate.angle = 90;
    arrowlo.style.display = "none";
    rectangleT.style.display = "inline";
  } else if (delta === "Even") {
    arrowG.groupTransform.rotate.angle = 0;
    arrowhi.style.display = "none";
    arrowlo.style.display = "none";
    rectangleT.style.display = "none";
  } else {
    arrowG.groupTransform.rotate.angle = 0;
    arrowhi.style.display = "none";
    arrowlo.style.display = "none"; 
    rectangleT.style.display = "none";
  }
}


 


//----------------------------------------------------------
//
// Deals with Vibrations 
//
//----------------------------------------------------------
function startAlertProcess(type, message) {
  display.poke();
  let messageDisplay = message;
  showAlert(messageDisplay);
  vibration.start(type);
 // console.log('vibration')
  emergencyInterval = setTimeout(function(){ messageDisplay = "DIABETIC CALL 911" }, 905000);
  vibrationInterval = setTimeout(function(){ startAlertProcess(type, messageDisplay) }, 3000);
  
}



function stopVibration() {
  clearTimeout(vibrationInterval);
  clearTimeout(emergencyInterval);
  vibration.stop();
}
//----------------------------------------------------------
//
// Alerts
//
//----------------------------------------------------------
const myPopup = document.getElementById("BGpopup");
const btnLeft = myPopup.getElementById("btnLeft");
const btnRight = myPopup.getElementById("btnRight");
const alertHeader = document.getElementById("alertHeader");


function showAlert(message) {
 // console.log('ALERT BG')
  //console.log(message); 
  alertHeader.text = message;
  myPopup.style.display = "inline";
  snoozeOn = true;
}

btnLeft.onclick = function() {
  //console.log("Mute");
  previousMuteBG = recordedBG;
  reminderTimer = (Math.round(Date.now()/1000) + 14400);
  myPopup.style.display = "none";
  
  stopVibration();
  requestData("Snooze");
  if (veryLowSnooze === true) {
    reminderTimer = (Math.round(Date.now()/1000) + 300);
  }
  snoozeOn = false;
  //refrshTimers();
}

btnRight.onclick = function() {
  let snoozeInt = parseInt(snoozeLength,10);
 // console.log("Snooze length" + snoozeInt);
  if ((snoozeInt >= 1) && (snoozeInt <= 240) ){
  reminderTimer = (Math.round(Date.now()/1000) + (snoozeInt*60) );
  // console.log("reminder timer" + (reminderTimer-(Date.now()/1000)) );
  } else {
  reminderTimer = (Math.round(Date.now()/1000) + 900 );
  //console.log("Snooze for 15 - default");
  }
 // console.log("Snooze");
  myPopup.style.display = "none";
  
  stopVibration();
  requestData("Snooze");
  if (veryLowSnooze === true) {
 //   reminderTimer = (Math.round(Date.now()/1000) + 300);
  }
  snoozeOn = false;
  //refrshTimers();
}

//----------------------------------------------------------
//
// Messaging
//
//----------------------------------------------------------

messaging.peerSocket.onopen = function() {
 // console.log("App Socket Open");
  initialCall();
}

messaging.peerSocket.onerror = function(err) {
  console.log("Connection error: " + err.code + " - " + err.message);
}

messaging.peerSocket.onmessage = function(evt) {
//  console.log(JSON.stringify(evt));
  if (evt.data.hasOwnProperty("settings")) {
    updateSettings(evt.data)
  } 
  if (evt.data.hasOwnProperty("bgdata")) {
    processBgs(evt.data);
  } 
  if (evt.data.hasOwnProperty("bgdataPop")) {
    
    processBgsPop(evt.data);
    
  } 
  
}


//Buttons

//----------------------------------------------------------
//
// Clock
//
//----------------------------------------------------------

//update with clock tick
clock.ontick = (evt) => {
 
  
  
    
    const queryMins = (Math.floor(((Date.now()/1000) - (lastPollTime/1000)) /60));
    minutesSinceQuery.text = queryMins + " mins";    
      
        if (queryMins > 999){
            minutesSinceQuery.text = "N/A";
        }
  
  if (queryMins >= 5){
   // console.log("refetch on 5 min timeout")
    //clearInterval(mainTimer);
    //mainTimer = setInterval(updateBGPollingStatus, 120000);
    updateBGPollingStatus()

  }
 
}
function processBgsPop(data) {
 // console.log("processBGPop")  
  console.log("JS memory: " + memory.js.used + "/" + memory.js.total);  
  let pointsPop = data.bgdataPop.sgv;
  let headingNumPop;
          //myGraphPop.setYRange(36, 250);
  currentBGPop = pointsPop[0];
  if(prefBgUnits === 'mmol') {         
        topPop.text = "14"
        //bottomPop.text = "2"
        headingNumPop = (pointsPop[0] / 18.018018).toFixed(1);
  } else {
        topPop.text = "250"
        //bottomPop.text = "36"
        headingNumPop = pointsPop[0];
  }
  
  if (isNaN(headingNumPop)) {headingNumPop = "?"};
  
   if (prefHighLevel && prefLowLevel) {
      myGraphPop.setHighLow(prefHighLevel, prefLowLevel);
   } else{
    requestData("Settings");
    }
      let tempMidSend = Math.floor((parseInt(prefHighLevel) + parseInt(prefLowLevel)) / 2);
          myGraphPop.update(pointsPop, headingNumPop, tempMidSend);
          
   if(prefBgUnits === 'mmol') {  
          let tempprefHighLevel =  (Math.round(mmol(prefHighLevel)*10))/10;
          let tempprefLowLevel = (Math.round(mmol(prefLowLevel)*10))/10;  
          highPop.text = tempprefHighLevel;
          midPop.text = ((tempprefHighLevel + tempprefLowLevel) *0.5).toFixed(1);//Math.floor(ymin + ((ymax-ymin) *0.5));
          lowPop.text = tempprefLowLevel;
      } else {
          highPop.text = prefHighLevel;
          midPop.text = Math.floor((parseInt(prefHighLevel) + parseInt(prefLowLevel)) / 2);
          lowPop.text = prefLowLevel;
      }
  
        

  
  
         GraphScreen.style.display = "inline";
        //  console.log("Graph screen on")  
          display.poke();
         
  
  
  
  //Non graph BG functions
      trend = data.bgdataPop.currentTrend;
      lastPollTime = data.bgdataPop.lastPollTime;
      lastPopTime = lastPollTime;
      latestDelta = data.bgdataPop.delta; 
      BGErrorGray1 = data.bgdataPop.BGerror;
       console.log("points:" + JSON.stringify(points));
      
  if(isNaN(currentBGPop) || BGErrorGray1 === true) {
        deltaDisplay.text = 'no data';
        setArrowDirection("Even");
        strikeLine.style.display = "inline";
        leftArc.style.fill = "#708090"; 
       
      } 
  else {
        strikeLine.style.display = "none";
        colorSet(currentBGPop); 
        processOneBg(currentBGPop);
      
        minutesSinceQuery.text = (Math.floor(((Date.now()/1000) - (lastPopTime/1000)) /60)) + " mins";    
      
        if ((Math.floor(((Date.now()/1000) - (lastPopTime/1000)) /60)) > 999){
            minutesSinceQuery.text = "N/A";
        } else if ((Math.floor(((Date.now()/1000) - (lastPopTime/1000)) /60)) < 0){
            minutesSinceQuery.text = "0 mins";       
        }
     
      
     // console.log(currentBG + typeof currentBG);
      //   console.log('reminder timer left: ' + (reminderTimer - Math.round(Date.now()/1000)))
  //
 
       veryLowSnooze = false; 
    
  //  console.log((reminderTimer - Math.round(Date.now()/1000)) )
  //alerts
        if( (currentBGPop >= prefHighLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
         
          display.poke();
          
          if((!disableAlert && snoozeOn===false) && bodyPresent===true && !(battery.charging===true)) {
            
             if((previousMuteBG - currentBGPop) > 35){
              //  console.log('BG REALLY HIGH') ;
                    reminderTimer = (Math.round(Date.now()/1000)) - 10;
                   if(prefBgUnits === 'mmol') {
                      startAlertProcess("nudge-max", ((Math.round(mmol(currentBGPop)*10))/10));
                    } else {
                      startAlertProcess("nudge-max", currentBGPop);
                    }
                } 
             else {
               // console.log('BG HIGH') ;
                    if(prefBgUnits === 'mmol') {
                      startAlertProcess("nudge-max", ((Math.round(mmol(currentBGPop)*10))/10));
                    } else {
                      startAlertProcess("nudge-max", currentBGPop);
                    }
              } 
          }   
        } 
         
   
        if((currentBGPop <= 45) && (((reminderTimer) <= Math.round(Date.now()/1000)) ) ) {
                
          display.poke();
          
               // console.log('BG VERY LOW') ;
                  if(prefBgUnits === 'mmol') {
                    let tempalertstring = "VERY LOW: " + ((Math.round(mmol(currentBGPop)*10))/10);
                  startAlertProcess("confirmation-max", tempalertstring);
                   } else {
                    let tempalertstring = "VERY LOW: " + currentBGPop;
                    startAlertProcess("confirmation-max", tempalertstring);
                   } 
                  veryLowSnooze = true;        
    
        } else if((currentBGPop <= prefLowLevel) && (reminderTimer <= Math.round(Date.now()/1000))) {
           
          display.poke();
          
            if((!disableAlert && snoozeOn===false) && bodyPresent===true) {  
                //  console.log('BG LOW') ;
                  if(prefBgUnits === 'mmol') {
                  startAlertProcess("nudge-max", ((Math.round(mmol(currentBGPop)*10))/10));
                   } else {
                  startAlertProcess("nudge-max", currentBGPop);
                   } 
           }
        }
    
  
     
    if( ( (currentBGPop < prefHighLevel ) && (currentBGPop > prefLowLevel ) ) && (snoozeRemove === true) ) {
      reminderTimer = Math.round(Date.now()/1000);
 
      veryLowSnooze = false;
   
    } 
    
    
    
  }

  popHolder = data;
};

return;

}
