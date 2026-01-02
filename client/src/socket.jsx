import { io } from "socket.io-client";

export const initSocket = async () => {
    const options = {
        'force new connection': true, // Fixed: Typo corrected
        reconnectionAttempts: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };

    const backendURL =import.meta.env.VITE_API_URL; // Updated to use environment variable
    return io(backendURL, options);
};
