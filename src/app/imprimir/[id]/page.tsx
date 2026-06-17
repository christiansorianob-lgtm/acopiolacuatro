import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ClientPrint } from "./ClientPrint";
import { PrintButton } from "./PrintButton";
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

        {/* Adjust width and padding for half-letter print: 5.5 x 8.5 in */}
        <div className="bg-white p-6 max-w-xl w-full rounded-xl shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0 print:max-w-full print:text-sm">
          
          {/* Header Agrovaspalma */}
          <div className="text-center pb-4 mb-4 border-b-2 border-slate-900">
            <h1 className="text-xl font-black uppercase text-slate-900 tracking-wider">SOCIEDAD AGROVASPALMA S.A.S.</h1>
            <p className="text-xs font-bold text-slate-700">NIT: 901.666.764-5</p>
            <p className="text-[10px] text-slate-600 font-medium">KDX 9-1 B Vrd Llano Grande - Norte de Santander</p>
            <p className="text-[10px] text-slate-600 font-medium">TEL: 315 393 0918</p>
            <p className="text-[10px] text-slate-600 font-medium">facturacion@agrovaspalma.com</p>
          </div>

          {/* Tiquete Info */}
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-base font-black uppercase tracking-widest text-slate-900">Centro Acopio</h2>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Tiquete de Báscula</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Tiquete N°</p>
              <p className="text-3xl font-black text-slate-900 leading-none">#{tiquete.numero?.toString().padStart(4, '0') || '---'}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{tiquete.estado || '---'}</p>
            </div>
          </div>

          {/* Data Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Vehículo</p>
              <p className="font-black text-sm text-slate-900">{tiquete.placa || '---'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Conductor</p>
              <p className="font-black text-sm text-slate-900 truncate">{tiquete.conductorNombre || '---'}</p>
            </div>
            
            {tiquete.proveedorNombre && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Proveedor / Finca</p>
                <p className="font-bold text-xs text-slate-700 truncate">{tiquete.proveedorNombre}</p>
              </div>
            )}
            {tiquete.clienteNombre && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cliente / Destino</p>
                <p className="font-bold text-xs text-slate-700 truncate">{tiquete.clienteNombre}</p>
              </div>
            )}
            
            {tiquete.productoNombre && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Producto</p>
                <p className="font-bold text-xs text-slate-700 truncate">{tiquete.productoNombre}</p>
              </div>
            )}
            {tiquete.origenNombre && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Origen</p>
                <p className="font-bold text-xs text-slate-700 truncate">{tiquete.origenNombre}</p>
              </div>
            )}
          </div>

          {/* Pesos */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4 print:bg-white print:border-slate-300">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entrada</p>
                <p className="text-xl font-mono font-bold text-slate-700">{tiquete.pesoEntrada || 0} <span className="text-sm">Kg</span></p>
                <p className="text-[9px] text-slate-400 font-semibold mt-1">{formatearFecha(tiquete.fechaEntrada)}</p>
              </div>
              <div className="border-l border-r border-slate-200 px-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Salida</p>
                <p className="text-xl font-mono font-bold text-slate-700">{tiquete.pesoSalida || "---"} <span className="text-sm">Kg</span></p>
                <p className="text-[9px] text-slate-400 font-semibold mt-1">{tiquete.fechaSalida ? formatearFecha(tiquete.fechaSalida) : "Pendiente"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">Neto</p>
                <p className="text-2xl font-mono font-black text-slate-900">{tiquete.pesoNeto || "---"} <span className="text-sm">Kg</span></p>
              </div>
            </div>
          </div>

          {/* Info Extra */}
          {(tiquete.remision || tiquete.observaciones) && (
            <div className="mb-4 border-t border-slate-200 pt-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Adicional</h3>
              <div className="grid grid-cols-2 gap-2">
                {tiquete.remision && (
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Remisión</p>
                    <p className="font-mono text-xs font-bold text-slate-700">{tiquete.remision}</p>
                  </div>
                )}
                {tiquete.observaciones && (
                  <div className={!tiquete.remision ? "col-span-2" : ""}>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Observaciones</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{tiquete.observaciones}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Firmas */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="border-t border-slate-300 w-4/5 mx-auto pt-1">
                <p className="text-[9px] font-bold uppercase text-slate-500">Báscula</p>
                <p className="text-[9px] text-slate-400 uppercase">{tiquete.usuarioSalida?.nombre || tiquete.usuarioEntrada?.nombre || "N/A"}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-slate-300 w-4/5 mx-auto pt-1">
                <p className="text-[9px] font-bold uppercase text-slate-500">Conductor</p>
                <p className="text-[9px] text-slate-400 uppercase">C.C. {(tiquete.conductorNombre || "").split(" ").slice(-1)}</p>
              </div>
            </div>
          </div>
          
          {/* Actions (Not Printed) */}
          <PrintButton />

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
