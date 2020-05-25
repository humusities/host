import hyperswarm from "hyperswarm";
import crypto from "crypto";

import limited from "./utils/create-swarm.js";

const hash = (data) => crypto.createHash("sha256").update(data).digest();

export default (defaultTopic = crypto.randomBytes(20).toString("hex")) => {
  const swarm = limited(hyperswarm());
  swarm.join(hash(defaultTopic), { lookup: true, announce: true });

  return {
    join: (topic) => swarm.join(hash(topic), { lookup: true, announce: true }),
    leave: (topic) => swarm.leave(hash(topic)),
    client: (...args) =>
      import("./client.js").then(({ default: f }) => f(swarm)(...args)),
    server: (...args) =>
      import("./server.js").then(({ default: f }) => f(swarm)(...args)),
  };
};
