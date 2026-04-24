import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (userId: string | undefined) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (userId) {
      const socketInstance = io('http://localhost:5000', {
        withCredentials: true,
      });

      socketInstance.on('connect', () => {
        setSocket(socketInstance);
      });

      socketInstance.emit('user_connected', userId);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [userId]);

  return socket;
};