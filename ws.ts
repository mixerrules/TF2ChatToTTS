import { Application, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { sleep } from "https://deno.land/x/sleep@v1.2.1/mod.ts";

const sockets = [];
const app = new Application({ logErrors: false });
const router = new Router();
router.get("/wss", (ctx) => {
  if (!ctx.isUpgradable) {
    ctx.throw(501);
  }
  const ws = ctx.upgrade();
  sockets.push(ws);
  ws.onopen = () => {
    ws.send("TF2 Chat To TTS started");
  };
  ws.onmessage = async (m) => {
    // Broadcast message to all connected clients
    for (const client of sockets) {
      try {
        client.send(m.data + "");
      } catch(e) {
        await sleep(5)
        client.send(m.data + "");
      }
    }

  };
  ws.onclose = () => { console.log("[%cTF2 Chat To TTS%c] %cTTS Window Lost Connection. Closing Script.", "color: #4441FF", "color: white", "color: green"); Deno.exit();};

});
app.use(router.routes());
app.use(router.allowedMethods());
app.listen({ port: 8000 });