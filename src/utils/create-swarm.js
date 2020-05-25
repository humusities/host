const getId = (socket) => `${socket.localAddress}:${socket.localPort}`;

export default (swarm) => {
  const callbacks = { connection: [], disconnection: [] };
  const connections = {};
  swarm.on("connection", (socket, details) => {
    connections[getId(socket)] = { socket, details };
    callbacks.connection.forEach((callback) => callback(socket, details));
  });
  swarm.on("disconnection", (socket, details) => {
    delete connections[getId(socket)];
    callbacks.disconnection.forEach((callback) => callback(socket, details));
  });

  swarm.on("disconnection", (socket, details) => {
    socket.destroy();
    details.destroy();
  });
  let topic = null;
  const gconnections = () => Object.freeze({ ...connections });
  const leave = (oldTopic, fn) => {
    Object.values(gconnections()).forEach(({ socket, details }) => {
      socket.destroy();
      details.destroy();
    });
    topic = null;
    swarm.leave(oldTopic, fn);
  };
  const join = (newTopic, options) => {
    if (topic) leave(topic);
    topic = newTopic;
    swarm.join(topic, options);
  };

  return {
    leave,
    join,
    connections: () => Object.freeze({ ...connections }),
    on: (event, callback) => {
      callbacks[event] = [...(callbacks[event] || []), callback];
      if (event === "connection") {
        Object.values(connections).forEach(({ socket, details }) =>
          callback(socket, details)
        );
      }
    },
  };
};
