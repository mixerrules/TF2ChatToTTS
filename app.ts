import { sleep } from "https://deno.land/x/sleep@v1.2.1/mod.ts";
import { retry } from "https://deno.land/x/retry@v2.0.0/mod.ts";
import { findTF2Location, getSettings } from "./utils.ts";

const filename = "D:\\SteamLibrary\\steamapps\\common\\Team Fortress 2\\tf\\tf2sm.log";

const settingsJson = await getSettings();

let tf2path = await findTF2Location() + ""
tf2path = tf2path.replace("\\\\", "\\\\\\")

const fullLogPath = tf2path + "\\tf\\" + settingsJson.consoleLogFile + ".log"

// Cleans log file on start
const file = await Deno.open(fullLogPath, { write: true });
await file.truncate(0);
file.close();

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
    // console.log(rawOutput)
    const lines = outStr.toString().split("\n");
    lines.forEach(function (line) {
        const parts = line.split("=");
        //console.log(parts)
        parts.forEach(function (items) {
            //console.log(items)
            //console.log(items)
            if (items.includes("hl2.exe")) {
                console.log("[%cTF2 Status%c] %cTF2 Is running on PID: " + items.match(/\d+/g)[1], "color: orange", "color: white", "color: green")
                //console.log("HL2.exe is running on PID: " + items.match(/\d+/g)[1])
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

// Worker for the Embed Broswer aka WebView
const wvWorker = new Worker(new URL("./gui.ts", import.meta.url).href, { type: "module" });
const wsWorker = new Worker(new URL("./ws.ts", import.meta.url).href, { type: "module" });


// connects to the websocket
const ws = new WebSocket("ws://localhost:8000/wss");
ws.onopen = () => console.log("Connected to server");
ws.onmessage = (message) => console.log("from server " + message.data);
ws.onclose = () => console.log("Disconnected from server");

// looks for changes in the log file then
// sends the chat lines to the socket
await sleep(5)
let lastSize = 0;
while (true) {
    const fileInfo = await Deno.stat(filename);
    const currentSize = fileInfo.size;

    if (currentSize > lastSize) {
        const file = await Deno.open(filename);
        await file.seek(lastSize, Deno.SeekMode.Start);

        const buffer = new Uint8Array(currentSize - lastSize);
        await file.read(buffer);

        const decoder = new TextDecoder();
        const text = decoder.decode(buffer);

        const lines = text.trim().split("\n");
        for (let i = 0; i < lines.length; i++) {
            if (/.*: .*/s.test(lines[i])) {
                const filteredPhrases = ["CreateEvent", "+tf_econ_item_preview", "JOY_AXIS_", `Requesting texture`, 'Unknown command:', 'Soundscape:', 'R_FindDynamicDecalSlot:', 'TODO:', 'Queued Material System:', '[Cloud]:', 'Host_WriteConfiguration:', 'Steamworks Stats:', 'KeyValues::ParseIncludedKeys:', 'Spawn Server:', 'Network:', 'SV_ActivateServer:', 'Created class baseline:', '[SteamNetworkingSockets] WARNING:', 'SetConVar:', 'Server Number:', 'Build:', 'Players:', 'Map:', 'Particles:', 'Particles:', 'CSoundPatch::Update:', ": can't be found on disk", 'CAsyncWavDataCache', 'Voice_Init', 'Signon traffic "CLIENT"', 'Restoring player view height', 'MoveInstanceHandle', 'Async I/O Force', 'pitch out of bounds', 'Resolved stuck player/player', "Started VScript virtual machine using script language 'Squirrel'", "not found.", "invalid bone array size", ", size", "No such sound"];

                // console.log(!filteredPhrases.some(substring => lines[i].includes(substring)))
                if (!filteredPhrases.some(substring => lines[i].includes(substring))) {
                    ws.send(lines[i])
                }
            }
        }


        lastSize = currentSize;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
}