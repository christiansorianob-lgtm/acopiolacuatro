"use client";

import { useState, useEffect } from "react";
import { Search, ExternalLink, Scale, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { registrarSalidaTiquete } from "@/app/actions/tiquetes";
import { useRouter, useSearchParams } from "next/navigation";
import { LectorBascula } from "@/components/ui/LectorBascula";

interface HistorialTableProps {
  initialData: any[]; // Usaremos any por simplicidad con Prisma types aquí
  usuarioId: number;
}

export function HistorialTable({ initialData, usuarioId }: HistorialTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState(searchParams.get("estado") || "TODOS");

  const paramEstado = searchParams.get("estado");
  const paramSalida = searchParams.get("salida");
  
  useEffect(() => {
    if (paramEstado) {
      setFilterEstado(paramEstado);
    }
  }, [paramEstado]);

  // Modal State
  const [selectedTiquete, setSelectedTiquete] = useState<any>(null);
  const [pesoSalida, setPesoSalida] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (paramSalida && initialData && !selectedTiquete) {
      const ticket = initialData.find(t => t.publicToken === paramSalida);
      if (ticket && ticket.estado === "ABIERTO") {
        setSelectedTiquete(ticket);
        setPesoSalida("");
        // Clean URL after opening (optional but cleaner)
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("salida");
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [paramSalida, initialData]);

  // Filtrado local
  const filteredData = initialData.filter(t => {
    const matchesSearch = 
      t.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.conductorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.numero.toString().includes(searchTerm);
      
    const matchesEstado = filterEstado === "TODOS" || t.estado === filterEstado;
    
    return matchesSearch && matchesEstado;
  });

  const handleOpenSalida = (tiquete: any) => {
    setSelectedTiquete(tiquete);
    setPesoSalida("");
  };

  const handleSaveSalida = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTiquete || pesoSalida === "" || Number(pesoSalida) <= 0) return;

    setSaving(true);
    const res = await registrarSalidaTiquete(selectedTiquete.id, Number(pesoSalida), usuarioId);
    if (res.success && res.data) {
      alert(`¡Salida registrada exitosamente! Peso Neto: ${res.data?.pesoNeto} Kg`);
      setSelectedTiquete(null);
      // Auto-open print window
      window.open(`/imprimir/${res.data.publicToken}`, '_blank');
      router.refresh();
    } else {
      alert(res.error);
    }
    setSaving(false);
  };

  const formatearFecha = (fechaStr: string) => {
    const date = new Date(fechaStr);
    return date.toLocaleString("es-CO", { 
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true, timeZone: 'America/Bogota'
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barra de Herramientas */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar placa, conductor o N°..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {["TODOS", "ABIERTO", "CERRADO"].map((est) => (
            <button
              key={est}
              onClick={() => setFilterEstado(est)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 md:flex-none ${
                filterEstado === est 
                  ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/50' 
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {est === "TODOS" ? "Todos" : est === "ABIERTO" ? "En Planta" : "Finalizados"}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Datos */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-900/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
              <th className="p-4 font-semibold whitespace-nowrap">N°</th>
              <th className="p-4 font-semibold whitespace-nowrap">Vehículo</th>
              <th className="p-4 font-semibold whitespace-nowrap">Movimiento</th>
              <th className="p-4 font-semibold whitespace-nowrap">Conductor</th>
              <th className="p-4 font-semibold whitespace-nowrap">Fecha Entrada</th>
              <th className="p-4 font-semibold whitespace-nowrap text-right">Peso Entrada</th>
              <th className="p-4 font-semibold whitespace-nowrap text-right">Peso Neto</th>
              <th className="p-4 font-semibold whitespace-nowrap text-center">Estado</th>
              <th className="p-4 font-semibold whitespace-nowrap text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-800/50">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-500">
                  No se encontraron tiquetes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              filteredData.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-mono text-cyan-400 font-medium">#{t.numero.toString().padStart(4, '0')}</td>
                  <td className="p-4">
                    <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded-md tracking-widest">{t.placa}</span>
                  </td>
                  <td className="p-4">
                    {t.estado === "ABIERTO" ? (
                      <span className="text-slate-500 text-xs font-medium italic">Pendiente</span>
                    ) : t.tipo === "INGRESO" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Entrada
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Salida
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="block text-slate-200">{t.conductorNombre}</span>
                    {t.proveedorNombre && <span className="block text-xs text-slate-500 truncate max-w-[150px]">{t.proveedorNombre}</span>}
                  </td>
                  <td className="p-4 text-slate-400 whitespace-nowrap">{formatearFecha(t.fechaEntrada)}</td>
                  <td className="p-4 text-right font-mono text-slate-300">{t.pesoEntrada} Kg</td>
                  <td className="p-4 text-right font-mono font-bold text-white">
                    {t.pesoNeto ? `${t.pesoNeto} Kg` : '-'}
                  </td>
                  <td className="p-4 text-center">
                    {t.estado === "ABIERTO" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        En Planta
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cerrado
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {t.estado === "ABIERTO" ? (
                      <button
                        onClick={() => handleOpenSalida(t)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Dar Salida
                      </button>
                    ) : (
                      <button 
                        onClick={() => window.open(`/imprimir/${t.publicToken}`, '_blank')}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                      >
                        Ver Tiquete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE SALIDA */}
      <Modal
        isOpen={!!selectedTiquete}
        onClose={() => !saving && setSelectedTiquete(null)}
        title="Registrar Salida de Planta"
      >
        {selectedTiquete && (
          <form onSubmit={handleSaveSalida} className="space-y-6">
            {/* Resumen del Tiquete */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 mb-0.5">Tiquete N°</p>
                <p className="font-mono text-cyan-400 font-bold">#{selectedTiquete.numero.toString().padStart(4, '0')}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Vehículo</p>
                <p className="font-bold tracking-widest text-white">{selectedTiquete.placa}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Peso Entrada</p>
                <p className="font-mono text-slate-300">{selectedTiquete.pesoEntrada} Kg</p>
              </div>
              <div>
                <p className="text-slate-500 mb-0.5">Tiempo en Planta</p>
                <p className="text-amber-500">
                  {Math.floor((new Date().getTime() - new Date(selectedTiquete.fechaEntrada).getTime()) / (1000 * 60 * 60))}h {' '}
                  {Math.floor(((new Date().getTime() - new Date(selectedTiquete.fechaEntrada).getTime()) / (1000 * 60)) % 60)}m
                </p>
              </div>
            </div>

            {/* Input Manual / Automático Peso Salida */}
            <div className="flex justify-center">
              <LectorBascula onPesoChange={(peso) => setPesoSalida(peso)} />
            </div>

            {/* Cálculo en vivo Peso Neto */}
            <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-emerald-500" />
                <span className="font-semibold text-emerald-500">Peso Neto Calculado:</span>
              </div>
              <span className="text-2xl font-mono font-bold text-white">
                {pesoSalida ? Math.abs(selectedTiquete.pesoEntrada - Number(pesoSalida)) : 0} Kg
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setSelectedTiquete(null)} 
                disabled={saving} 
                className="px-4 py-3 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving || !pesoSalida} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                ) : (
                  <>Finalizar Viaje <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}
