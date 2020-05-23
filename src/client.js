import { EventEmitter } from "events";

const log = console.log;
const peerLink = ({ host, port }) => `http://${host}:${port}`;

class Peers extends EventEmitter {
  constructor() {
    super();
    this.set = new Set();
  }
  add(peer) {
    this.set.add(peer);
    this.emit("connection", peer);
  }
  delete(peer) {
    this.set.delete(peer);
    this.emit("disconnection", peer);
  }
  toList() {
    return Object.freeze([...this.set]);
  }
}

export default (swarm) => () => {
  const peers = new Peers()
    .on("connection", (peer) => log("connection", peerLink(peer)))
    .on("disconnection", (peer) => log("disconnection", peerLink(peer)));
  swarm.on("connection", (_, { peer }) => peer && peers.add(peer));
  swarm.on("disconnection", (_, { peer }) => peer && peers.delete(peer));
  return peers;
};
