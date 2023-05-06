import { Webview } from "https://deno.land/x/webview@0.7.5/mod.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.1/mod.ts";
await sleep(5);

const html = Deno.readTextFileSync("./-console.html")

const webview = new Webview();
webview.title = "TF2 Text To Speech";

webview.navigate(`data:text/html,${encodeURIComponent(html)}`);
webview.run();