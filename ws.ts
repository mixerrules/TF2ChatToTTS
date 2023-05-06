import { Application, Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";

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
    console.log("Connected to client");
    ws.send("TF2 Chat To TTS started");
  };
  ws.onmessage = (m) => {
    console.log("Got message from client: ", m.data);
    // Broadcast message to all connected clients
    for (const client of sockets) {
      client.send(m.data + "");
    }

  };
  ws.onclose = () => console.log("Disconncted from client");
});
app.use(router.routes());
app.use(router.allowedMethods());
app.listen({ port: 8000 });