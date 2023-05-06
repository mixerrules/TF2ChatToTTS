# TF2ChatToTTS
TF2 Chat To TTS is an exteneral script/app, made using TypeScript and Deno, that reads from a TF2 Log File and prints out any chat messages. *Note:* This is tested and built for windows since it relys on Microsoft TTS voices.

(THIS SHOULD ALSO WORK FOR ANY SOURCE GAME BUT I HAVE ONLY TESTED IT WITH Team Fortress 2)

## Requirements:
*Note*: there are no compiled binaries due to Deno [not supporting the compiling of NPM & Node packages](https://github.com/denoland/deno/issues/15960), so it will have to be started by command line or a bat file.
- [Deno](https://deno.com/manual@v1.33.2/getting_started/installation) 

## Features:
- Team Only mode
- Filter Out "Trade Chat"
- Swear Filter:
  - None (no filter)
  - Light (slurs and extremes)
  - Heavy (Filters Everything basically)
- Changable TTS Voice
- Disable the reading of names

## TF2 Setup:
- Open Steam
- Find Team Fortress 2 In your library
- Right click on the name in the library
- Click "properties"
- Under launch options add: ```+con_logfile "FILENAME.log"``` (change "Filename" to whatever you want the file to be named: Default is "ttslog")
- Start game.

## App Setup:
- Download the [Latest Version](https://deno.com/manual@latest/getting_started/installation) of [Deno](https://Deno.land).
- Download the [Latest Version](https://github.com/mixerrules/TF2ChatToTTS/archive/refs/heads/main.zip) of TF2 Chat To TTS.
- Extract it to the location of your choosing.
- *Optional:* edit the config "-settings.json" (Only change the "consoleLogFile" and "autoStart" options)
- Open the folder in Terminal or CMD.
- Start the TTS using the Line: 
```
deno --unstable run --allow-ffi --allow-net --allow-env --allow-write --allow-read --allow-run app.ts 
```

## How to get More TTS voices:
You can change the TTS voice using the windows built-in voices, you can get more voices here: [Open Settings](ms-settings:speech).


## Known issues:
- App does not close if you just close the TTS window. (Click CTRL + C in cmd or terminal to end it.)
- Sometimes when starting the app it will crash with a "Not Ready State" error, run it again it should fix itself.
- Some languages may not get printed out by the TTS (blame javascript)
