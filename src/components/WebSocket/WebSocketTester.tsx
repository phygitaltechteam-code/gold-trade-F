import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { Radio, RefreshCw, Send, Trash2, CheckCircle2, XCircle, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

export const WebSocketTester: React.FC = () => {
  const { status, isConnected, lastMessage, sendMessage, connect, disconnect, url } = useWebSocket();
  const [testPayload, setTestPayload] = useState('{"type":"PING","message":"Hello from Admin"}');
  const [logs, setLogs] = useState<Array<{ id: string; time: string; type: string; data: any }>>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Append incoming messages to local log
  useEffect(() => {
    if (lastMessage) {
      const newLog = {
        id: Math.random().toString(36).substring(7),
        time: new Date().toLocaleTimeString(),
        type: lastMessage.type || 'MESSAGE',
        data: lastMessage,
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // keep last 50
    }
  }, [lastMessage]);

  const handleSend = () => {
    try {
      const parsed = JSON.parse(testPayload);
      const success = sendMessage(parsed);
      if (success) {
        setLogs((prev) => [
          {
            id: Math.random().toString(36).substring(7),
            time: new Date().toLocaleTimeString(),
            type: 'SENT 📤',
            data: parsed,
          },
          ...prev,
        ]);
      }
    } catch {
      // Send as string
      const success = sendMessage(testPayload);
      if (success) {
        setLogs((prev) => [
          {
            id: Math.random().toString(36).substring(7),
            time: new Date().toLocaleTimeString(),
            type: 'SENT (RAW) 📤',
            data: testPayload,
          },
          ...prev,
        ]);
      }
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full dark:bg-emerald-950/30 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            CONNECTED
          </span>
        );
      case 'CONNECTING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full dark:bg-amber-950/30 dark:text-amber-400">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-500" />
            CONNECTING...
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full dark:bg-rose-950/30 dark:text-rose-400">
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            ERROR
          </span>
        );
      case 'DISCONNECTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full dark:bg-slate-800 dark:text-slate-400">
            <WifiOff className="w-3 h-3 text-slate-400" />
            DISCONNECTED
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white dark:bg-boxdark rounded-xl shadow-md border border-stroke dark:border-strokedark overflow-hidden my-4 transition-all">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 dark:bg-meta-4 border-b border-stroke dark:border-strokedark flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-black dark:text-white">
              WebSocket Connection Tester
            </h3>
            <p className="text-xs text-slate-500 font-mono truncate max-w-[280px] sm:max-w-md">
              {url}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-xs px-2.5 py-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 border border-slate-200 rounded-md hover:bg-white"
          >
            {isMinimized ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <div className="p-5 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-meta-4/50 rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <button
                  onClick={disconnect}
                  className="px-3.5 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <WifiOff className="w-3.5 h-3.5" /> Disconnect
                </button>
              ) : (
                <button
                  onClick={connect}
                  className="px-3.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Wifi className="w-3.5 h-3.5" /> Connect Now
                </button>
              )}

              <button
                onClick={() => sendMessage({ type: 'PING', timestamp: Date.now() })}
                disabled={!isConnected}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send Ping
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Total Messages: <span className="font-semibold text-slate-700 dark:text-slate-300">{logs.length}</span>
            </div>
          </div>

          {/* Test Send Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Send Custom Payload (JSON or String):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                placeholder='{"type":"TEST","data":{}}'
                className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-lg focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSend}
                disabled={!isConnected}
                className="px-4 py-2 bg-primary hover:bg-opacity-90 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>

          {/* Live Message Log Console */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Live Socket Events & Messages Stream:
              </span>
              {logs.length > 0 && (
                <button
                  onClick={() => setLogs([])}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <div className="h-48 overflow-y-auto bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500 italic">
                  No messages yet. Waiting for WebSocket activity...
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2 rounded border transition-all ${log.type.includes('SENT')
                        ? 'bg-blue-950/40 border-blue-900/60 text-blue-200'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                      }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1 opacity-70">
                      <span className="font-semibold text-primary">{log.type}</span>
                      <span>{log.time}</span>
                    </div>
                    <pre className="text-[11px] whitespace-pre-wrap break-all overflow-x-auto text-emerald-400">
                      {typeof log.data === 'object'
                        ? JSON.stringify(log.data, null, 2)
                        : String(log.data)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSocketTester;
