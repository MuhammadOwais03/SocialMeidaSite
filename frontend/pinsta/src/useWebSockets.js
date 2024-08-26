import { useEffect, useState, useCallback } from 'react';

const useWebSocket = (url) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);

    const handleOpen = useCallback(() => {
        console.log('WebSocket connection opened');
    }, []);

    const handleMessage = useCallback((event) => {
        console.log('WebSocket message received:', event.data);
        try {
            const data = JSON.parse(event.data); // Parse JSON data if applicable
            setMessages(data);
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            setMessages(event.data); // Fallback for non-JSON data
        }
    }, []);

    const handleClose = useCallback((event) => {
        console.log('WebSocket connection closed', event);
    }, []);

    const handleError = useCallback((error) => {
        console.error('WebSocket error:', error);
    }, []);

    const send = useCallback((message) => {
        if (socket) {
            socket.send(message);
        } else {
            console.error('WebSocket is not connected');
        }
    }, [socket]);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = handleOpen;
        ws.onmessage = handleMessage;
        ws.onclose = handleClose;
        ws.onerror = handleError;

        setSocket(ws);

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [url, handleOpen, handleMessage, handleClose, handleError]);

    return { socket, messages, send };
};

export default useWebSocket;




