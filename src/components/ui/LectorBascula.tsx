"use client";

import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2, AlertCircle, Link as LinkIcon, Unlink, Activity, MonitorSmartphone, MousePointer2, RefreshCcw } from 'lucide-react';
import { useScale } from '@/contexts/ScaleContext';

interface LectorBasculaProps {
  onPesoChange: (peso: number, unidad: string) => void;
}

export function LectorBascula({ onPesoChange }: LectorBasculaProps) {
  const [modo, setModo] = useState<'MANUAL' | 'AUTOMATICO'>('MANUAL');
  
  // Estado Manual
  const [pesoManual, setPesoManual] = useState<string>('');

  // Estado Automático global
  const { isConnected, isStable, currentWeight, currentUnit, error, connectSerial, disconnectSerial } = useScale();
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Peso Confirmado
  const [pesoConfirmado, setPesoConfirmado] = useState<{ peso: number, unidad: string, modo: 'MANUAL' | 'AUTOMATICO' } | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !('serial' in navigator)) {
      setIsSupported(false);
    }
  }, []);

  const handleConfirmar = (peso: number, unidad: string, modoPesaje: 'MANUAL' | 'AUTOMATICO') => {
    setPesoConfirmado({ peso, unidad, modo: modoPesaje });
    onPesoChange(peso, unidad);
  };

  const handleRepetir = () => {
    setPesoConfirmado(null);
    onPesoChange(0, 'kg'); // Limpiar en el padre
    setPesoManual('');
  };

  // --- MODO MANUAL ---
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const peso = parseFloat(pesoManual);
    if (!isNaN(peso) && peso > 0) {
      handleConfirmar(peso, 'kg', 'MANUAL');
    }
  };

  // --- MODO AUTOMÁTICO ---
  const handleCaptureAuto = () => {
    const peso = parseFloat(currentWeight);
    if (!isNaN(peso) && peso > 0) {
      handleConfirmar(peso, currentUnit, 'AUTOMATICO');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl w-full max-w-2xl text-slate-200">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex-1 min-w-[200px]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-500 shrink-0" />
            <span className="truncate">Captura de Peso</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">Selecciona el modo de ingreso de datos</p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800 w-full sm:w-auto shrink-0">
          <button
            onClick={() => !pesoConfirmado && setModo('MANUAL')}
            disabled={!!pesoConfirmado}
            className={`flex-1 justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${modo === 'MANUAL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <MousePointer2 className="w-4 h-4 shrink-0" />
            <span className="truncate">Manual</span>
          </button>
          <button
            onClick={() => !pesoConfirmado && setModo('AUTOMATICO')}
            disabled={!!pesoConfirmado}
            className={`flex-1 justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${modo === 'AUTOMATICO' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <MonitorSmartphone className="w-4 h-4 shrink-0" />
            <span className="truncate">Automático</span>
          </button>
        </div>
      </div>

      {error && modo === 'AUTOMATICO' && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-red-400">Error</h4>
            <p className="text-sm text-red-300/90 break-words">{error}</p>
          </div>
        </div>
      )}

      {pesoConfirmado ? (
        <div className="animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 sm:p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-4 shadow-inner shadow-emerald-500/5">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-emerald-400 font-bold text-lg mb-1 tracking-widest">PESO REGISTRADO</h3>
              <div className="text-5xl font-mono font-bold text-white my-3">
                {pesoConfirmado.peso.toFixed(2)} <span className="text-3xl text-emerald-500">{pesoConfirmado.unidad.toUpperCase()}</span>
              </div>
              <p className="text-sm text-emerald-500/80 font-medium">MODO DE CAPTURA: {pesoConfirmado.modo}</p>
            </div>
            <button
              onClick={handleRepetir}
              className="mt-6 bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 border border-slate-700 shadow-lg hover:shadow-xl"
            >
              <RefreshCcw className="w-5 h-5" />
              Repetir Pesaje
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* CONTENIDO MODO MANUAL */}
          {modo === 'MANUAL' && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <form onSubmit={handleManualSubmit} className="flex flex-wrap gap-4 items-end bg-slate-950/50 p-4 sm:p-6 rounded-xl border border-slate-800/50">
                <div className="flex-1 min-w-[200px] w-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Peso Manual (KG)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.01"
                    required
                    value={pesoManual}
                    onChange={(e) => setPesoManual(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-2xl font-mono text-emerald-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex-1 min-w-[150px] bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shrink-0 sm:h-[56px]"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  Confirmar
                </button>
              </form>
            </div>
          )}

          {/* CONTENIDO MODO AUTOMÁTICO */}
          {modo === 'AUTOMATICO' && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              {!isSupported ? (
                <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-amber-400 mb-2">Navegador no compatible</h3>
                  <p className="text-sm text-amber-300/80">
                    Tu navegador no soporta la API Web Serial. Por favor, usa Google Chrome, Microsoft Edge o un navegador basado en Chromium moderno para conectar tu báscula automáticamente.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800/50 space-y-6">
                  
                  {/* Controles de conexión */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
                      <span className="text-sm font-semibold text-slate-300">
                        {isConnected ? 'Báscula Conectada' : 'Desconectado'}
                      </span>
                    </div>

                    {!isConnected ? (
                      <button
                        onClick={connectSerial}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-slate-700"
                      >
                        <LinkIcon className="w-4 h-4" />
                        Conectar Báscula
                      </button>
                    ) : (
                      <button
                        onClick={disconnectSerial}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <Unlink className="w-4 h-4" />
                        Desconectar
                      </button>
                    )}
                  </div>

                  {/* Display de Peso en Vivo */}
                  <div className={`relative border-2 rounded-xl p-8 transition-colors duration-300 flex flex-col items-center justify-center min-h-[200px] ${isConnected ? (isStable ? 'border-emerald-500/50 bg-emerald-500/5 shadow-inner shadow-emerald-500/10' : 'border-amber-500/50 bg-amber-500/5') : 'border-slate-800 bg-slate-900/50'}`}>
                    
                    {/* Indicador de Estabilidad */}
                    {isConnected && (
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        {isStable ? (
                          <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> ESTABLE (ST)
                          </span>
                        ) : (
                          <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 animate-pulse">
                            <Activity className="w-3 h-3" /> INESTABLE (US)
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-baseline justify-center gap-3">
                      <span className={`text-7xl font-mono font-bold tracking-tighter transition-all ${isConnected ? (isStable ? 'text-emerald-400' : 'text-amber-400') : 'text-slate-700'}`}>
                        {isConnected ? currentWeight : '---'}
                      </span>
                      <span className={`text-2xl font-bold uppercase ${isConnected ? 'text-slate-400' : 'text-slate-700'}`}>
                        {isConnected ? currentUnit : 'KG'}
                      </span>
                    </div>
                    
                    {/* Metadatos de puerto */}
                    {isConnected && (
                      <div className="absolute bottom-4 right-4 text-xs font-mono text-slate-500 flex items-center gap-1">
                        <Settings className="w-3 h-3" /> 9600-8-N-1
                      </div>
                    )}
                  </div>

                  {/* Botón Capturar */}
                  {isConnected && (
                    <button
                      onClick={handleCaptureAuto}
                      disabled={!isStable || parseFloat(currentWeight) <= 0}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      {isStable ? 'Capturar Peso Actual' : 'Esperando Estabilidad...'}
                    </button>
                  )}

                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}

// Icono faltante
function Scale(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  )
}
