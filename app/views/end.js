import exercise from "exercise";
import document from "document";
import * as utils from "../lib/utils";
import { View, $at } from "../lib/view";
import Clock from "../subviews/clock";
import * as fs from "fs";
import analytics from "fitbit-google-analytics/app"
import * as config from "../config";

const $ = $at("#view-end");

export class ViewEnd extends View {
  el = $();

  lblActiveTime = $("#lblActiveTime");
  lblHeartRateAvg = $("#lblHeartRateAvg");
  lblHeartRateMax = $("#lblHeartRateMax");
  lblSpeedAvg = $("#lblSpeedAvg");
  lblSpeedMax = $("#lblSpeedMax");
  lblDistance = $("#lblDistance");
  lblavgBG = $("#avgBG");

  onMount() {
    const clickGraph = document.getElementById("clickGraph");
    clickGraph.style.display = "none";


    let exerciseSelectend = fs.readFileSync("/private/data/Exercise.txt", "cbor");
    analytics.send({
      
        hit_type: "event",
        event_category: "Display",
        event_action: "Tap",
        event_label: JSON.stringify(config.exerciseName[exerciseSelectend._index])
    })
    
    const BGitems = document.getElementById("BGobjects");
    BGitems.style.display="none";
    this.clock = new Clock("#subview-clock2", "seconds");
    this.insert(this.clock);
    
    this.lblActiveTime.text = `active time: ${utils.formatActiveTime(
      exercise.stats.activeTime || 0
    )}`;

    this.lblHeartRateAvg.text = `heart rate avg: ${exercise.stats.heartRate
      .average || 0} bpm`;
    this.lblHeartRateMax.text = `heart rate max: ${exercise.stats.heartRate
      .max || 0} bpm`;

    const speedAvg = utils.formatSpeed(exercise.stats.speedAvg || 0);
    this.lblSpeedAvg.text = `speed avg: ${speedAvg.value} ${speedAvg.units}`;

    const speedMax = utils.formatSpeed(exercise.stats.speedMax || 0);
    this.lblSpeedMax.text = `speed max: ${speedMax.value} ${speedMax.units}`;

    const distance = utils.formatDistance(exercise.stats.distance || 0);
    this.lblDistance.text = `distance: ${distance.value} ${distance.units}`;
    
    const avgBG = document.getElementById("avgBG");
    avgBG.style.visibility="visible";

   
    
  fs.unlinkSync("/private/data/Exercise.txt");
  
  }

  onRender() {}

  onUnmount() {}
}
