import DictEmitter from "./utils/dict-emitter.js";
import createInteractiveWebdav from "@humusities/interactive-webdav";

const log = console.log;
const peerLink = ({ host = "localhost", port }) => `http://${host}:${port}`;

export default (swarm) => () => {
  const peers = new DictEmitter()
    .on("add", (peer) =>
      log("connection", peerLink(peer), peerLink(peer.staticServer.address()))
    )
    .on("delete", (peer) => log("disconnection", peer && peerLink(peer)));

  swarm.on("connection", (_, details) => {
    swarm.on("data", (data) => {
      console.log(data.toString());
      if (data.toString() === "close") {
        socket.destroy();
        details.destroy();
      }
    });
    const { peer } = details;
    if (peer) {
      Promise.resolve(
        createInteractiveWebdav({
          inject: `<script>window.webdav="${peerLink(peer)}"</script>`,
        })
      )
        .then((staticServer) => ({
          ...peer,
          staticServer,
        }))
        .then((updatedPeer) => peers.add(peerLink(updatedPeer), updatedPeer));
    }
  });

  peers.on("delete", ({ staticServer }) => staticServer.close());

  swarm.on("disconnection", (_, { peer }) => {
    if (peer) peers.delete(peerLink(peer));
  });
  return peers;
};
