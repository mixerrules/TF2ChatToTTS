import { sleep } from "https://deno.land/x/sleep@v1.2.1/mod.ts";
import { retry } from "https://deno.land/x/retry@v2.0.0/mod.ts";
import { findTF2Location, getSettings } from "./utils.ts";

const settingsJson = await getSettings();

let tf2path = await findTF2Location() + ""
tf2path = tf2path.replace("\\\\", "\\\\\\")

const fullLogPath = tf2path + "tf\\" + settingsJson.consoleLogFile + ".log"

// Cleans log file on start
try {
    const file = await Deno.open(fullLogPath, { write: true });
    await file.truncate(0);
    file.close();
} catch (e) {
    console.log("Log file does not exist yet");
}

// Dev Mode/Debug info
console.log("[%cTF2 Chat To TTS%c] %cStarted Version: " + settingsJson.version, "color: #4441FF", "color: white", "color: green")
if (settingsJson.debugMode) {
    console.log("[%cTF2 Chat To TTS%c] %cStarted in Dev Mode. ", "color: #4441FF", "color: white", "color: orange")
}

// Starts TF2 is its enabled in the settings.
if (settingsJson.autoStart == "true") {
    const tf2process = Deno.run({ cmd: ["cmd", "/c", `C:\\"Program Files (x86)"\\Steam\\steam.exe -applaunch 440`, "exit"] })
    console.log("[%cTF2 Auto Start%c] %cStarting TF2.. ", "color: orange", "color: white", "color: yellow")
}

// Checks if TF2 Is running
let hl2pid = " ";
let gameStatus = 0;

console.log("[%cTF2 Auto Start%c] %cChecking TF2 Status.. ", "color: orange", "color: white", "color: yellow")

checkTF2Status();
setInterval(checkTF2Status, 15000);
async function checkTF2Status() {

    const process = Deno.run({ cmd: ["cmd", "/c", `tasklist`], stdout: "piped" })

    const output = await process.output()
    process.close()

    const outStr = new TextDecoder().decode(output);

    if (settingsJson.debugMode) {
        console.log(outStr)
    }

    const lines = outStr.toString().split("\n");
    lines.forEach(function (line) {
        const parts = line.split("=");

        if (settingsJson.debugMode) {
            console.log(parts)
        }

        parts.forEach(function (items) {

            if (settingsJson.debugMode) {
                console.log(items)
            }

            if (items.includes("hl2.exe")) {
                console.log("[%cTF2 Status%c] %cTF2 Is running on PID: " + items.match(/\d+/g)[1], "color: orange", "color: white", "color: green")

                if (settingsJson.debugMode) {
                    console.log("HL2.exe is running on PID: " + items.match(/\d+/g)[1])
                }

                hl2pid = items.match(/\d+/g)[1];
                gameStatus = 1;
            }

        });
    });

    if (!outStr.toString().includes("hl2.exe")) {
        gameStatus = 0;
        console.log("[%cTF2 Status%c] %cTF2 Is not running! ", "color: orange", "color: white", "color: red")
    }

}

// Worker for the WebView and Sockets
const wvWorker = new Worker(new URL("./gui.ts", import.meta.url).href, { type: "module" });
const wsWorker = new Worker(new URL("./ws.ts", import.meta.url).href, { type: "module" });


// connects to the websocket
const ws = new WebSocket("ws://localhost:8000/wss");
ws.onopen = () => console.log("[%cWebSocket%c] %cTTS Passer Connected", "color: #48066F", "color: white", "color: #B79E79", "color: white")
ws.onmessage = (message) => console.log("[%cWebSocket%c] %cData Sent To TTS:\n%c" + message.data, "color: #48066F", "color: white", "color: #B79E79", "color: white");
ws.onclose = () => { Deno.exit(); }

// Update checking function
await sleep(10)
checkVersion()
setInterval(checkVersion, 90000);
async function checkVersion() {
    const url = 'https://raw.githubusercontent.com/mixerrules/TF2ChatToTTS/main/-settings.json';
    const response = await fetch(url);
    const data = await response.json();
    const localData = settingsJson;
    if (data.version !== localData.version) {
        console.log("[%cTF2 Chat To TTS%c] %cYou are using version " + settingsJson.version + ", Current version is " + data.version, "color: #4441FF", "color: white", "color: orange")
        console.log("[%cTF2 Chat To TTS%c] %cYou can download the new update from: %chttps://github.com/mixerrules/TF2ChatToTTS/releases", "color: #4441FF", "color: white", "color: orange", "color: blue")
        ws.send("There is an update available for TF2 Chat To TTS, we recommend you upgrade from our GitHub.")
    } else {
        if (settingsJson.debugMode) {
            console.log('Versions are the same');
        }
    }
}


// looks for changes in the log file then
// sends the chat lines to the socket
await sleep(5)
let lastSize = 0;
while (true) {
    const fileInfo = await Deno.stat(fullLogPath);
    const currentSize = fileInfo.size;

    if (currentSize > lastSize) {
        const file = await Deno.open(fullLogPath);
        await file.seek(lastSize, Deno.SeekMode.Start);

        const buffer = new Uint8Array(currentSize - lastSize);
        await file.read(buffer);

        const decoder = new TextDecoder();
        const text = decoder.decode(buffer);

        const lines = text.trim().split("\n");
        for (let i = 0; i < lines.length; i++) {
            if (/.*: .*/s.test(lines[i])) {
                const filteredPhrases = ["CreateEvent", "+tf_econ_item_preview", "JOY_AXIS_", `Requesting texture`, 'Unknown command:', 'Soundscape:', 'R_FindDynamicDecalSlot:', 'TODO:', 'Queued Material System:', '[Cloud]:', 'Host_WriteConfiguration:', 'Steamworks Stats:', 'KeyValues::ParseIncludedKeys:', 'Spawn Server:', 'Network:', 'SV_ActivateServer:', 'Created class baseline:', '[SteamNetworkingSockets] WARNING:', 'SetConVar:', 'Server Number:', 'Build:', 'Players:', 'Map:', 'Particles:', 'Particles:', 'CSoundPatch::Update:', ": can't be found on disk", 'CAsyncWavDataCache', 'Voice_Init', 'Signon traffic "CLIENT"', 'Restoring player view height', 'MoveInstanceHandle', 'Async I/O Force', 'pitch out of bounds', 'Resolved stuck player/player', "Started VScript virtual machine using script language 'Squirrel'", "not found.", "invalid bone array size", ", size", "No such sound", "lobby received", "Disconnect:", "#TF_MM", "CMaterial", "SurfFlagsToSortGroup"];

                if (!filteredPhrases.some(substring => lines[i].includes(substring))) {
                    ws.send(lines[i])
                }
            }
        }


        lastSize = currentSize;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
}