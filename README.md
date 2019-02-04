# Exerclock
Exercise app for Fitbit OS that includes CGM

**If you do not know how to load from the developer menu, please look for this app in the fitbit clock face gallery as "Exerclock Exercie with CGM". Or click on this link from your phone: [Marclock CGM & Weather](https://gam.fitbit.com/gallery/app/f483f7c4-b592-4760-a50b-234ef75cc912)**

# Instructions

- You must have your blood sugars accessible through a URL. (Examples include [xDrip+](https://github.com/jamorham/xDrip-plus), [Nightscout](http://www.nightscout.info/wiki/welcome/set-up-nightscout-using-heroku), [Spike](https://spike-app.com/) )
  - If you are using **xDrip** 
    - Navigate to `Settings` -> `Inter-App settings` -> `xDrip Web Service` -> `ON` 
  - If you are using **Spike**  
    - Activate internal server in `Settings` -> `integration` -> `internal HTTP server` -> `ON` click back to confirm the changes.
  - If you are using **NightScout** you can follow these instructions: http://www.nightscout.info/wiki/welcome/set-up-nightscout-using-heroku. 
    - You will then have a URL address that looks like **https://YOURADDRESS.herokuapp.com**

- Starting on your phone, navigate to the [latest version of Exerclock](https://gam.fitbit.com/gallery/app/f483f7c4-b592-4760-a50b-234ef75cc912) and click the **Select** button. Then click **install**. 
- After the installation has finished open the **Fitbit** app and navigate to **clock faces** then click the **green gear** to access **Exerclock's settings**.
- Once in settings:  
  - Select your Data Source: either **xDrip** ,  **spike** , or **nightscout**
    - If you are using **nightscout** - you **must** enter your nightscout address. The address you enter should be something like **https://YOURADDRESS.herokuapp.com** , where 'YOURADDRESS' is replaced with your personal site address. **DO NOT include anything after '.com'**
   - Select whether you would like to manually set the BG settings or have the watchface use the setting from xdrip/spike/nightscout
   - Select how many minutes you would like to have the watch snooze an alert, when you select snooze for an alert. Note that **Snooze** is for how many minuites you set, while **Mute** is for 4 hours.
   - Select whether you would like to have the watchface turn off any current Snooze or Mute timers if your BG goes back in range.
   - Select whether you would like to disable all alerts (except very low)
- If you would like to change to a 24 hour clock or to a 12 hour clock, go to change the 'Clock Display Time' preference on your fitbit profile: https://www.fitbit.com/settings/profile. 

When opening the app, you will first be presented with a clickable list to select your exercise. Note that only **run, hiking, walk, cycling, and golf support GPS**

Note that speed and distance will only start being recorded after the GPS signal is connected (if there is one to get). The app will give a slight vibration after it has connected to GPS to let you know distance and speed are now being tracked.

BG readings are fetched around every 2 minutes. 

Units/thresholds are taken from source (e.g., from xdrip) or as inputted manually in the settings.

'Disable alert' should disable all alerts except very low.

On alerts, 'Mute' is for 4 HOURS, 'Snooze' is for as many minutes as set in the settings (default 15 minutes). 
Snooze and mute should ALSO snooze alert on xdrip/spike.

In the settings you can select whether you would like the snooze and mute to clear when BG is back in range.

MAKE SURE TO have your phone in bluetooth range of the watch. And ensure that the fitbit app is permitted to run in the background.

**DO NOT USE FOR ANY MEDICAL/TREATMENT PURPOSES!**

Twitter: @cramis123

Thanks to the fitbit clockfaces published by PedanticAvenger (FlashCGM) and Rytiggy (Glance) for helping with the CGM code.
