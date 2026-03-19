import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000"; 

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
});

export const connectSocket = (userId) => {
    if (!socket.connected) {
        socket.connect();
        console.log("Socket Connected ✅");
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
        console.log("Socket Disconnected ❌");
    }
};