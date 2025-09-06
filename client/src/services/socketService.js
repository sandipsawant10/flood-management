import io from "socket.io-client";

let socket = null;

export const initializeSocket = (token) => {
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    socket = io(url, {
      auth: { token },
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
