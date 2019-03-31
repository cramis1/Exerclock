import { me } from "appbit";
import document from "document";
import * as config from "../config";
import * as fs from "fs";

import { Application, View, $at } from "../lib/view";

const $ = $at("#view-select");

export class ViewSelect extends View {
  el = $();
 
  constructor() {
    this.btnStart = $("#btnStart");
    this.lblTitle = $("#lblTitle");
    
    super();
  }

  handleStart = () => {
    Application.switchTo("ViewExercise");
  }

  handleKeypress = (evt) => {
    if (evt.key === "down") this.handleStart();
  }

  onMount() {
    me.appTimeoutEnabled = false; // Disable timeout
    
    
    this.btnStart.addEventListener("click", this.handleStart);
    document.addEventListener("keypress", this.handleKeypress);
  }

  onRender() {
   
    
    let exerciseSelect = fs.readFileSync("/private/data/Exercise.txt", "cbor");
    this.lblTitle.text = config.exerciseName[exerciseSelect._index];
  }

  onUnmount() {
    this.btnStart.removeEventListener("click", this.handleStart);
    document.removeEventListener("keypress", this.handleKeypress);
  }
  
}
