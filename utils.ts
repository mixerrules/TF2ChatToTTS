import * as vdf from "npm:simple-vdf-mstan";
const settingsPath = "./-settings.json";


export async function findTF2Location() {
  const SteamLibraries = await vdf.parse(await Deno.readTextFile("C:\\Program Files (x86)\\Steam\\steamapps\\libraryfolders.vdf"))

  for (const library in SteamLibraries.libraryfolders) {

    if (SteamLibraries.libraryfolders[library].apps["440"]) {

      console.log("[%cTF2 Installation%c] %cFound in " + SteamLibraries.libraryfolders[library].path.replace(/\\\\/g, `\\`) + "\\steamapps\\common\\Team Fortress 2\\", "color: orange", "color: white", "color: green")
      return SteamLibraries.libraryfolders[library].path.replace(/\\\\/g, `\\`) + "\\steamapps\\common\\Team Fortress 2\\";
    }
  }
}

export async function getSettings() {
  try {
    return JSON.parse(await Deno.readTextFile(settingsPath));
  } catch (e) {
    console.log("Error read config:" + e.message);
  }
}

export async function writeSettings(Data: JSON) {
  try {
    await Deno.writeTextFile(settingsPath, JSON.stringify(Data));
  } catch (e) {
    console.log("[Settings Writer] ERROR: " + e);
  }
}
