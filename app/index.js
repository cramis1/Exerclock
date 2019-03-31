import { Application } from "./lib/view";
import {BGrequest} from "./BGping";
import { ViewEnd } from "./views/end";
import { ViewExercise } from "./views/exercise";
import { ViewSelect } from "./views/select";
import * as fs from "fs";
import document from "document";
import analytics from "fitbit-google-analytics/app"
import { memory } from "system";

analytics.configure({
  tracking_id: "UA-132854245-1"
})

console.log("JS memory1: " + memory.js.used + "/" + memory.js.total);
BGrequest();
console.log("JS memory2: " + memory.js.used + "/" + memory.js.total);

class MultiScreenApp extends Application {
  screens = { ViewSelect, ViewExercise, ViewEnd };
}

//fs.writeFileSync ("/private/data/Exercise.txt", {"_index":0}, "json");

const list = document.getElementById("my-list");
const items = list.getElementsByClassName("tile-list-item");
    
    items.forEach((element, index) => {
        let touch = element.getElementById("touch-me");
        touch.onclick = (evt) => {
          let exerciseSelect = {"_index":index};
          
          fs.writeFileSync ("/private/data/Exercise.txt", exerciseSelect, "cbor");
          list.style.display="none"
          console.log("touched: " + index);
          console.log("JS memory3: " + memory.js.used + "/" + memory.js.total);
          MultiScreenApp.start("ViewSelect");
          analytics.send({
            hit_type: "screenview",
            screen_name: "Main View"
          })
        }
      });


//console.log("Whatrequest:" + BGrequest());



