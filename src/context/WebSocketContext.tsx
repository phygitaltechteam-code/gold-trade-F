import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useAuthContext } from '@/context/AuthContext';

export type WebSocketStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface WebSocketMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

export type MessageHandler = (data: any) => void;

interface WebSocketContextType {
  status: WebSocketStatus;
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (msg: object | string) => boolean;
  subscribe: (eventType: string, handler: MessageHandler) => () => void;
  connect: () => void;
  disconnect: () => void;
  url: string;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  wsUrl?: string;
  autoConnect?: boolean;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  wsUrl,
  autoConnect = true,
}) => {
  const { token, isAuthenticated } = useAuthContext();
  const [status, setStatus] = useState<WebSocketStatus>('DISCONNECTED');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const subscribersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const isManuallyClosedRef = useRef<boolean>(false);

  // Compute default WebSocket URL from VITE_WS_URL or VITE_SERVER_URL
  const getWebSocketUrl = useCallback(() => {
    if (wsUrl) return wsUrl;

    const envWsUrl = import.meta.env.VITE_WS_URL;
    if (envWsUrl) return envWsUrl;

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5677';
    try {
      const parsed = new URL(serverUrl);
      const protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
      // Connect to root or /ws on the server host:port
      return `${protocol}//${parsed.host}/ws`;
    } catch {
      return 'ws://192.168.29.227:5677/ws';
    }
  }, [wsUrl]);

  const activeUrl = getWebSocketUrl();

  // Connect function
  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    isManuallyClosedRef.current = false;
    setStatus('CONNECTING');

    try {
      // Append token query param if available
      let targetUrl = activeUrl;
      const accessToken = token?.accessToken;
      if (accessToken) {
        const separator = targetUrl.includes('?') ? '&' : '?';
        targetUrl = `${targetUrl}${separator}token=${encodeURIComponent(accessToken)}`;
      }

      console.log('[WebSocket] Connecting to:', targetUrl);
      const ws = new WebSocket(targetUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        setStatus('CONNECTED');
        reconnectAttemptsRef.current = 0;

        // Send auth handshake if needed
        if (accessToken) {
          try {
            ws.send(JSON.stringify({ type: 'AUTH', token: accessToken }));
          } catch (e) {
            console.error('[WebSocket] Failed to send auth handshake', e);
          }
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsed: WebSocketMessage =
            typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          setLastMessage(parsed);

          // Dispatch to specific event subscribers
          if (parsed && parsed.type) {
            const handlers = subscribersRef.current.get(parsed.type);
            if (handlers) {
              handlers.forEach((handler) => {
                try {
                  handler(parsed.data !== undefined ? parsed.data : parsed);
                } catch (err) {
                  console.error(`[WebSocket] Error in subscriber for ${parsed.type}:`, err);
                }
              });
            }
          }

          // Also dispatch wildcard '*' subscribers
          const wildcardHandlers = subscribersRef.current.get('*');
          if (wildcardHandlers) {
            wildcardHandlers.forEach((handler) => {
              try {
                handler(parsed);
              } catch (err) {
                console.error('[WebSocket] Error in wildcard subscriber:', err);
              }
            });
          }
        } catch (e) {
          // Plain text message
          const rawMsg: WebSocketMessage = { type: 'RAW', data: event.data };
          setLastMessage(rawMsg);
        }
      };

      ws.onerror = (err) => {
        console.error('[WebSocket] Error:', err);
        setStatus('ERROR');
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Closed (code:', event.code, 'reason:', event.reason, ')');
        setStatus('DISCONNECTED');
        socketRef.current = null;

        // Auto-reconnect if not manually closed
        if (!isManuallyClosedRef.current) {
          const maxAttempts = 10;
          if (reconnectAttemptsRef.current < maxAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
            reconnectAttemptsRef.current += 1;
            console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          }
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      setStatus('ERROR');
    }
  }, [activeUrl, token?.accessToken]);

  // Disconnect function
  const disconnect = useCallback(() => {
    isManuallyClosedRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setStatus('DISCONNECTED');
  }, []);

  // Send message
  const sendMessage = useCallback((msg: object | string): boolean => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = typeof msg === 'string' ? msg : JSON.stringify(msg);
      socketRef.current.send(payload);
      return true;
    }
    console.warn('[WebSocket] Cannot send message: Socket is not open.');
    return false;
  }, []);

  // Subscribe to specific event types
  const subscribe = useCallback((eventType: string, handler: MessageHandler) => {
    if (!subscribersRef.current.has(eventType)) {
      subscribersRef.current.set(eventType, new Set());
    }
    const handlers = subscribersRef.current.get(eventType)!;
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        subscribersRef.current.delete(eventType);
      }
    };
  }, []);

  // Manage connection based on authentication & autoConnect
  useEffect(() => {
    if (autoConnect && isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, isAuthenticated, connect, disconnect]);

  const value: WebSocketContextType = {
    status,
    isConnected: status === 'CONNECTED',
    lastMessage,
    sendMessage,
    subscribe,
    connect,
    disconnect,
    url: activeUrl,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
