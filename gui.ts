import { Webview } from "https://deno.land/x/webview@0.7.5/mod.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.1/mod.ts";
import { getArrayFromFile } from "./utils.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.10.3/mod.ts";

const trade = await getArrayFromFile("tradingwords");
const light = await getArrayFromFile("lightmode");
const heavy = await getArrayFromFile("heavymode");

const html = await renderFileToString("./gui.ejs", {
    tradewords: trade,
    lightwords: light,
    heavywords: heavy,
  })
await sleep(5);
const webview = new Webview();
webview.title = "TF2 Text To Speech";

webview.navigate(`data:text/html,${encodeURIComponent(html)}`);
webview.run();
