import { useEffect, useRef, useState, useCallback } from 'react';

export interface LedgerFilterObj {
  companyId?: string;
  superBrokerId?: string;
  masterBrokerId?: string;
  brokerId?: string;
  customerId?: string;
  id?: string;
  [key: string]: any;
}

export interface LiveTradeUpdate {
  orderId?: string;
  tradeId?: string;
  transactionId?: string;
  status?: string;
  pnl?: number;
  'p&l'?: number;
  currentPrice?: number;
  buyPrice?: number;
  sellPrice?: number;
  [key: string]: any;
}

interface UseTransactionLedgerSocketOptions {
  filterObj?: LedgerFilterObj;
  token?: string;
  onTradeChanged?: (data?: any) => void;
  onLiveUpdate?: (trades: LiveTradeUpdate[]) => void;
}

export function useTransactionLedgerSocket({
  filterObj = {},
  token,
  onTradeChanged,
  onLiveUpdate,
}: UseTransactionLedgerSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [livePnlMap, setLivePnlMap] = useState<Record<string, number>>({});
  const [liveTradesMap, setLiveTradesMap] = useState<Record<string, LiveTradeUpdate>>({});

  // Compute WebSocket URL
  const getWsUrl = useCallback(() => {
    const envWs = import.meta.env.VITE_WS_URL;
    if (envWs) return envWs;

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5677';
    try {
      const url = new URL(serverUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${url.host}`;
    } catch {
      return 'ws://localhost:5677';
    }
  }, []);

  useEffect(() => {
    const baseWsUrl = getWsUrl();
    const queryParams = new URLSearchParams();
    queryParams.set('room', 'transaction_ledger');

    Object.entries(filterObj).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        queryParams.set(key, String(val));
      }
    });
    if (token) queryParams.set('token', token);

    const wsUrl = `${baseWsUrl}?${queryParams.toString()}`;
    console.log('✅ Connecting to Transaction Ledger WS:', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ Connected to Transaction Ledger WS');
      setIsConnected(true);

      // Send Join Request payload as specified by backend
      const joinPayload: any = {
        type: 'JOIN_TRANSACTION_LEDGER',
        ...filterObj,
      };

      try {
        ws.send(JSON.stringify(joinPayload));
      } catch (err) {
        console.error('Failed to send JOIN_TRANSACTION_LEDGER:', err);
      }
    };

    ws.onmessage = (event) => {
      try {
        const res = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.log('📥 [TransactionLedger WS Message]:', res?.type || res?.action, res);

        // A) Initial snapshot or Real-time P&L Live Update
        if (
          res.type === 'TRANSACTION_LEDGER_OPEN_TRADES' ||
          res.type === 'TRANSACTION_LEDGER_LIVE_UPDATE'
        ) {
          const trades: LiveTradeUpdate[] = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res)
              ? res
              : res.trades || [res.data || res];

          const pnlUpdates: Record<string, number> = {};
          const tradeUpdates: Record<string, LiveTradeUpdate> = {};

          trades.forEach((item) => {
            const key = item.orderId || item.tradeId || item.transactionId || item.id || item._id;
            if (key) {
              const pnlVal = item.pnl !== undefined ? item.pnl : item['p&l'];
              if (pnlVal !== undefined && pnlVal !== null) {
                pnlUpdates[String(key)] = Number(pnlVal);
              }
              tradeUpdates[String(key)] = item;
            }
          });

          setLivePnlMap((prev) => ({ ...prev, ...pnlUpdates }));
          setLiveTradesMap((prev) => ({ ...prev, ...tradeUpdates }));

          if (onLiveUpdate) {
            onLiveUpdate(trades);
          }
        }

        // B) New trade placed or position closed -> Refresh table data
        if (
          res.type === 'TRANSACTION_LEDGER_TRADE_CHANGED' ||
          res.action === 'REFRESH_TABLE'
        ) {
          console.log('🔄 [TransactionLedger WS] Trade changed, refreshing table data via REST API');
          if (onTradeChanged) {
            onTradeChanged(res.data);
          }
        }
      } catch (err) {
        console.error('WS Parse Error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('Transaction Ledger WS Error:', err);
    };

    ws.onclose = () => {
      console.log('❌ Disconnected from Transaction Ledger WS');
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'LEAVE_TRANSACTION_LEDGER' }));
        } catch (_) { }
      }
      ws.close();
    };
  }, [JSON.stringify(filterObj), token, getWsUrl]);

  return {
    livePnlMap,
    liveTradesMap,
    isConnected,
    wsRef,
  };
}
