import DictEmitter from "./utils/dict-emitter.js";
import createInteractiveWebdav from "@humusities/interactive-webdav";

const log = console.log;
const peerLink = ({ host = "localhost", port }) => `http://${host}:${port}`;

export default (swarm) => () => {
  const peers = new DictEmitter()
    .on("add", (peer) =>
      log("connection", peerLink(peer), peerLink(peer.static.server.address()))
    )
    .on("delete", (peer) => log("disconnection", peer && peerLink(peer)));

  swarm.on("connection", (_, details) => {
    swarm.on("data", (data) => {
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
        .then((server) => ({
          ...peer,
          static: {
            server,
            address: {
              host: "localhost",
              port: server.address().port,
            },
          },
        }))
        .then((updatedPeer) => peers.add(peerLink(updatedPeer), updatedPeer));
    }
  });

  peers.on("delete", ({ static: { server } }) => server.close());

  swarm.on("disconnection", (_, { peer }) => {
    if (peer) peers.delete(peerLink(peer));
  });
  return peers;
};
