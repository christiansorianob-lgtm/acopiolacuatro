import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ClientPrint } from "./ClientPrint";
import { Scale } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ImprimirTiquetePage({ params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tiqueteId = parseInt(id);
    if (isNaN(tiqueteId)) notFound();

    const tiquete = await prisma.tiquetes.findUnique({
      where: { id: tiqueteId },
      include: {
        usuarioEntrada: true,
        usuarioSalida: true,
      }
    });

    if (!tiquete) notFound();

    const formatearFecha = (fechaStr: Date | null | undefined) => {
      if (!fechaStr) return "N/A";
      try {
        const date = new Date(fechaStr);
        return date.toLocaleString("es-CO", { 
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit", hour12: true
        });
      } catch (e) {
        return "Fecha inválida";
      }
    };

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 print:p-0 print:bg-white text-slate-900">
        
        {/* ClientPrint handles window.print() on mount */}
        <ClientPrint />

        <div className="bg-white p-8 max-w-2xl w-full rounded-xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-full">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 text-white rounded-lg print:border-2 print:border-slate-900 print:bg-white print:text-slate-900">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black uppercase tracking-widest text-slate-900">Centro Acopio</h1>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Tiquete de Báscula</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 uppercase font-bold tracking-wider mb-1">Tiquete N°</p>
              <p className="text-4xl font-black text-slate-900">#{tiquete.numero?.toString().padStart(4, '0') || '---'}</p>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase">{tiquete.estado || '---'}</p>
            </div>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Vehículo</p>
              <p className="font-black text-lg text-slate-900">{tiquete.placa || '---'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Conductor</p>
              <p className="font-black text-lg text-slate-900">{tiquete.conductorNombre || '---'}</p>
            </div>
            
            {tiquete.proveedorNombre && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Proveedor / Finca</p>
                <p className="font-bold text-slate-700">{tiquete.proveedorNombre}</p>
              </div>
            )}
            {tiquete.clienteNombre && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Cliente / Destino</p>
                <p className="font-bold text-slate-700">{tiquete.clienteNombre}</p>
              </div>
            )}
            
            {tiquete.productoNombre && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Producto</p>
                <p className="font-bold text-slate-700">{tiquete.productoNombre}</p>
              </div>
            )}
            {tiquete.origenNombre && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Origen</p>
                <p className="font-bold text-slate-700">{tiquete.origenNombre}</p>
              </div>
            )}
          </div>

          {/* Pesos */}
          <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200 mb-8 print:bg-white print:border-slate-300">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Peso Entrada</p>
                <p className="text-2xl font-mono font-bold text-slate-700">{tiquete.pesoEntrada || 0} Kg</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">{formatearFecha(tiquete.fechaEntrada)}</p>
              </div>
              <div className="border-l border-r border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Peso Salida</p>
                <p className="text-2xl font-mono font-bold text-slate-700">{tiquete.pesoSalida || "---"} Kg</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">{tiquete.fechaSalida ? formatearFecha(tiquete.fechaSalida) : "Pendiente"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-2">Peso Neto</p>
                <p className="text-3xl font-mono font-black text-slate-900">{tiquete.pesoNeto || "---"} Kg</p>
              </div>
            </div>
          </div>

          {/* Info Extra */}
          {(tiquete.remision || tiquete.observaciones) && (
            <div className="mb-8 border-t border-slate-200 pt-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Información Adicional</h3>
              <div className="grid grid-cols-2 gap-4">
                {tiquete.remision && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Remisión N°</p>
                    <p className="font-mono text-sm font-bold text-slate-700">{tiquete.remision}</p>
                  </div>
                )}
                {tiquete.observaciones && (
                  <div className={!tiquete.remision ? "col-span-2" : ""}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Observaciones</p>
                    <p className="text-sm text-slate-600">{tiquete.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Firmas */}
          <div className="mt-16 grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-t-2 border-slate-300 w-4/5 mx-auto pt-2">
                <p className="text-xs font-bold uppercase text-slate-500">Operador de Báscula</p>
                <p className="text-[10px] text-slate-400 uppercase mt-1">{tiquete.usuarioSalida?.nombre || tiquete.usuarioEntrada?.nombre || "N/A"}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-slate-300 w-4/5 mx-auto pt-2">
                <p className="text-xs font-bold uppercase text-slate-500">Firma Conductor</p>
                <p className="text-[10px] text-slate-400 uppercase mt-1">C.C. {(tiquete.conductorNombre || "").split(" ").slice(-1)}</p>
              </div>
            </div>
          </div>
          
          {/* Actions (Not Printed) */}
          <div className="mt-12 text-center print:hidden">
            <button 
              onClick={() => window.print()} 
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Imprimir Tiquete
            </button>
          </div>

        </div>
      </div>
    );
  } catch (error) {
    console.error("Error renderizando tiquete:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center border-t-4 border-red-500">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error al cargar tiquete</h2>
          <p className="text-slate-500">Ha ocurrido un problema al procesar los datos de este tiquete.</p>
          <pre className="text-xs text-left mt-4 bg-slate-50 p-2 rounded text-slate-400 overflow-auto">{String(error)}</pre>
        </div>
      </div>
    );
  }
}
