import net from "net";
import caddyAdapter from "@humusities/node-webdav";

export default (swarm) => async (root) => {
  const instance = await caddyAdapter(root);
  console.log(`Local CaddyWebdav: http://localhost:${instance.port}`);
  swarm.on("connection", (socket) => {
    socket.on("data", (message) => {
      const service = new net.Socket();
      service
        .connect(instance.port, "127.0.0.1", () => service.write(message))
        .on("data", (data) => socket.write(data))
        .on("error", console.error);
    });
  });

  return { ...instance, root };
};
