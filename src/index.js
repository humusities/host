import hyperswarm from "hyperswarm";
import crypto from "crypto";

import limited from "./utils/create-swarm.js";

export default () => {
  const swarm = limited(hyperswarm());
  const topic = crypto.createHash("sha256").update("the-commoners").digest();
  swarm.join(topic, { lookup: true, announce: true });

  return {
    client: (...args) =>
      import("./client.js").then(({ default: f }) => f(swarm)(...args)),
    server: (...args) =>
      import("./server.js").then(({ default: f }) => f(swarm)(...args)),
  };
};
