"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface ScaleContextType {
  isConnected: boolean;
  isStable: boolean;
  currentWeight: string;
  currentUnit: string;
  error: string | null;
  connectSerial: () => Promise<void>;
  disconnectSerial: () => Promise<void>;
  clearError: () => void;
}

const ScaleContext = createContext<ScaleContextType | undefined>(undefined);

export function ScaleProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isStable, setIsStable] = useState(false);
  const [currentWeight, setCurrentWeight] = useState('0.00');
  const [currentUnit, setCurrentUnit] = useState('kg');
  const [error, setError] = useState<string | null>(null);

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const keepReadingRef = useRef(true);

  // Auto-connect if possible
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof navigator !== 'undefined' && 'serial' in navigator) {
        try {
          const ports = await (navigator as any).serial.getPorts();
          if (ports && ports.length > 0) {
            // Ya hay puertos autorizados previamente, intentamos conectar al primero
            await connectToPort(ports[0]);
          }
        } catch (err) {
          console.error("No se pudo autoconectar al puerto serial", err);
        }
      }
    };

    autoConnect();

    return () => {
      disconnectSerial();
    };
  }, []);

  const parseSerialData = (text: string) => {
    if (text.includes('OL')) {
      setError('Sobrecarga en la báscula (OL)');
      return;
    }

    const estable = text.includes('ST');
    setIsStable(estable);

    // Extraer número
    const matchNumerico = text.match(/([+-]?\s*\d+\.?\d*)/);
    if (matchNumerico && matchNumerico[1]) {
      const valorLimpio = matchNumerico[1].replace(/\s+/g, '');
      const pesoNum = parseFloat(valorLimpio);
      if (!isNaN(pesoNum)) {
        setCurrentWeight(pesoNum.toFixed(2));
      }
    }

    // Extraer unidad
    if (text.toLowerCase().includes('kg')) {
      setCurrentUnit('kg');
    } else if (text.toLowerCase().includes('lb')) {
      setCurrentUnit('lb');
    }
  };

  const connectToPort = async (portToConnect: any) => {
    try {
      setError(null);
      await portToConnect.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
      portRef.current = portToConnect;
      setIsConnected(true);
      keepReadingRef.current = true;
      
      const decoder = new TextDecoderStream();
      const inputDone = portToConnect.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;
      const reader = inputStream.getReader();
      readerRef.current = reader;

      readLoop(reader);
    } catch (err: any) {
      console.error('Error al abrir puerto:', err);
      setError(err.message || 'Error de conexión');
      setIsConnected(false);
    }
  };

  const readLoop = async (reader: any) => {
    let buffer = '';
    while (portRef.current && keepReadingRef.current) {
      try {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        if (value) {
          buffer += value;
          const lines = buffer.split(/[\r\n]+/);
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim().length > 0) {
              parseSerialData(line);
            }
          }
        }
      } catch (error) {
        console.error('Error leyendo datos:', error);
        break;
      }
    }
  };

  const connectSerial = async () => {
    if (!('serial' in navigator)) {
      setError('Web Serial API no está soportada en este navegador. Usa Chrome o Edge.');
      return;
    }

    try {
      const port = await (navigator as any).serial.requestPort();
      await connectToPort(port);
    } catch (err: any) {
      console.error('Error solicitando puerto:', err);
      setError('No se seleccionó ningún puerto o hubo un error.');
    }
  };

  const disconnectSerial = async () => {
    keepReadingRef.current = false;
    
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        console.error('Error al cancelar lector:', e);
      }
    }

    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch (e) {
        console.error('Error al cerrar puerto:', e);
      }
      portRef.current = null;
    }
    
    setIsConnected(false);
    setIsStable(false);
    setCurrentWeight('0.00');
  };

  const clearError = () => setError(null);

  return (
    <ScaleContext.Provider
      value={{
        isConnected,
        isStable,
        currentWeight,
        currentUnit,
        error,
        connectSerial,
        disconnectSerial,
        clearError,
      }}
    >
      {children}
    </ScaleContext.Provider>
  );
}

export const useScale = () => {
  const context = useContext(ScaleContext);
  if (context === undefined) {
    throw new Error('useScale debe ser usado dentro de un ScaleProvider');
  }
  return context;
};
