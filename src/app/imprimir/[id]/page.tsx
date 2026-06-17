import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PrintButton } from './PrintButton';
import { QRCodeSVG } from 'qrcode.react';
import { generarFirmaTiquete } from '@/lib/crypto';
import { headers } from 'next/headers';

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
        }).toUpperCase();
      } catch (e) {
        return "FECHA INVÁLIDA";
      }
    };

    const firma = generarFirmaTiquete(tiquete);
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const verificationUrl = `${protocol}://${host}/verificar?t=${tiquete.numero}&firma=${firma}`;

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center py-8">
        
        {/* Print wrapper to extract content */}
        <div id="ticket-content" className="bg-white w-[816px] h-[1056px] relative mx-auto overflow-hidden text-slate-900 border border-slate-200 shadow-xl">
          
          <div className="p-[8mm_10mm] h-full flex flex-col">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                {/* Logo Placeholder */}
                <div className="w-24 h-24 rounded-full border-[3px] border-[#1e4022] flex items-center justify-center bg-white shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1e4022" strokeWidth="1.5" className="w-14 h-14">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v19M4 8l8-5 8 5M7 11l5-4 5 4M10 15l2-3 2 3" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h1 className="text-[22px] font-black text-[#1e4022] tracking-tight">SOCIEDAD AGROVASPALMA S.A.S.</h1>
                  <p className="text-[13px] font-bold text-slate-800">NIT: 901.666.764-5</p>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-800"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> KDX 9-1 B Vrd Llano Grande - Norte de Santander</div>
                  <div className="flex gap-4 text-[11px] font-medium text-slate-800">
                    <div className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg> 315 393 0918</div>
                    <div className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> facturacion@agrovaspalma.com</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-black uppercase tracking-wide text-slate-900">TIQUETE DE PESAJE</h2>
                <p className="text-4xl font-black text-[#B91C1C] leading-none mb-2 mt-1">#{tiquete.numero.toString().padStart(6, '0')}</p>
                <p className="text-[11px] text-slate-600">Fecha de emisión:</p>
                <p className="text-[13px] font-semibold text-slate-900">{formatearFecha(tiquete.fechaEntrada)}</p>
              </div>
            </div>

            <div className="border-t-[3px] border-slate-300 w-full mb-4"></div>

            <div className="grid grid-cols-2 gap-4 mb-4 flex-grow-0">
              {/* Box 1: Pesaje */}
              <div className="border-2 border-[#1e4022] rounded-xl overflow-hidden">
                <div className="px-4 py-2 flex items-center gap-2 border-b border-[#1e4022]">
                  <svg className="w-5 h-5 text-[#1e4022]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"></path></svg>
                  <h3 className="font-black text-[#1e4022] text-[13px] uppercase">Pesaje</h3>
                </div>
                <div className="p-4 flex">
                  <div className="w-1/2 space-y-4 border-r border-dotted border-slate-300 pr-4">
                    <div>
                      <p className="text-[11px] text-slate-900 font-medium">Fecha y hora entrada:</p>
                      <p className="text-[12px] text-slate-900 border-b border-dotted border-slate-300 pb-1">{formatearFecha(tiquete.fechaEntrada)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-900 font-medium">Fecha y hora salida:</p>
                      <p className="text-[12px] text-slate-900 border-b border-dotted border-slate-300 pb-1">{tiquete.fechaSalida ? formatearFecha(tiquete.fechaSalida) : '---'}</p>
                    </div>
                  </div>
                  <div className="w-1/2 pl-4 space-y-3">
                    <div className="grid grid-cols-[auto_1fr] items-end border-b border-dotted border-slate-300 pb-1 gap-2">
                      <p className="text-[12px] text-slate-900 font-medium">Peso Entrada:</p>
                      <p className="text-[15px] font-bold text-slate-900 text-right">{tiquete.pesoEntrada} kg</p>
                    </div>
                    <div className="grid grid-cols-[auto_1fr] items-end border-b border-dotted border-slate-300 pb-1 gap-2">
                      <p className="text-[12px] text-slate-900 font-medium">Peso Salida:</p>
                      <p className="text-[15px] font-bold text-slate-900 text-right">{tiquete.pesoSalida !== null ? `${tiquete.pesoSalida} kg` : '0 kg'}</p>
                    </div>
                    <div className="flex justify-between items-center bg-[#eef5ef] rounded px-3 py-2 mt-2">
                      <p className="text-[13px] font-black text-[#1e4022] uppercase">PESO NETO:</p>
                      <p className="text-[20px] font-black text-[#1e4022]">{tiquete.pesoNeto !== null ? `${tiquete.pesoNeto} kg` : '---'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Vehículo */}
              <div className="border-2 border-[#1e4022] rounded-xl overflow-hidden">
                <div className="px-4 py-2 flex items-center gap-2 border-b border-[#1e4022]">
                  <svg className="w-5 h-5 text-[#1e4022]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                  <h3 className="font-black text-[#1e4022] text-[13px] uppercase">Vehículo y Conductor</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between">
                    <div className="w-1/2">
                      <p className="text-[11px] text-slate-900 font-medium">Placa:</p>
                      <p className="text-[14px] font-bold text-slate-900 uppercase">{tiquete.placa}</p>
                    </div>
                    <div className="w-1/2 text-right">
                      <p className="text-[11px] text-slate-900 font-medium">Tipo de vehículo:</p>
                      <p className="text-[13px] text-slate-900 uppercase">TRACTOCAMIÓN</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[90px_1fr] text-[12px] gap-y-1">
                    <p className="text-slate-900 font-medium">Conductor:</p>
                    <p className="text-slate-900 uppercase">{tiquete.conductorNombre}</p>
                    <p className="text-slate-900 font-medium">Cédula:</p>
                    <p className="text-slate-900 uppercase">{tiquete.conductorNombre?.split(' ').slice(-1)[0] || '---'}</p>
                    <p className="text-slate-900 font-medium mt-1">Transportador:</p>
                    <p className="text-slate-900 uppercase mt-1">{tiquete.transportador || 'TRANSPORTADOR'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[1.5fr_1fr] gap-4 mb-4 flex-grow-0">
              {/* Box 3: Producto */}
              <div className="border-2 border-[#1e4022] rounded-xl overflow-hidden">
                <div className="px-4 py-2 flex items-center gap-2 border-b border-[#1e4022]">
                  <svg className="w-5 h-5 text-[#1e4022]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                  <h3 className="font-black text-[#1e4022] text-[13px] uppercase">Información del Producto</h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[12px]">
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">Proveedor:</p>
                    <p className="text-slate-900 uppercase">{tiquete.proveedorNombre || 'TERCERO'}</p>
                  </div>
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">Origen:</p>
                    <p className="text-slate-900 uppercase">{tiquete.origenNombre || 'ORIGEN'}</p>
                  </div>
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">Producto:</p>
                    <p className="text-slate-900 uppercase">{tiquete.productoNombre || 'PRODUCTO'}</p>
                  </div>
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">Destino:</p>
                    <p className="text-slate-900 uppercase">{tiquete.destinoNombre || 'DESTINO'}</p>
                  </div>
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">Tipo de fruta:</p>
                    <p className="text-slate-900 uppercase">{tiquete.tipoFruta || 'TERCERO'}</p>
                  </div>
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">Remisión:</p>
                    <p className="text-slate-900 uppercase">{tiquete.remision || 'REMISIÓN'}</p>
                  </div>
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">Variedad:</p>
                    <p className="text-slate-900 uppercase">{tiquete.variedad || '(SI APLICA)'}</p>
                  </div>
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">Lote:</p>
                    <p className="text-slate-900 uppercase">{tiquete.lote || '(SI APLICA)'}</p>
                  </div>
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">Estado fruta:</p>
                    <p className="text-slate-900 uppercase">{tiquete.estadoFruta || 'FRESCA'}</p>
                  </div>
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">Finca:</p>
                    <p className="text-slate-900 uppercase">{tiquete.finca || '(SI APLICA)'}</p>
                  </div>
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">% Impurezas:</p>
                    <p className="text-slate-900 uppercase">{tiquete.porcentajeImpurezas || '(SI APLICA)'}</p>
                  </div>
                  <div className="grid grid-cols-[85px_1fr]">
                    <p className="text-slate-900 font-bold">Centro costo:</p>
                    <p className="text-slate-900 uppercase">{tiquete.centroCosto || '(SI APLICA)'}</p>
                  </div>
                  <div className="col-span-2 grid grid-cols-[125px_1fr] mt-1 pt-3 border-t border-dotted border-slate-300">
                    <p className="text-slate-900 font-bold">Hora de descargue:</p>
                    <p className="text-slate-900 uppercase">{tiquete.horaDescargue || '(SI APLICA)'}</p>
                  </div>
                </div>
              </div>

              {/* Box 4: Otros */}
              <div className="border-2 border-[#1e4022] rounded-xl overflow-hidden flex flex-col">
                <div className="px-4 py-2 flex items-center gap-2 border-b border-[#1e4022]">
                  <svg className="w-5 h-5 text-[#1e4022]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <h3 className="font-black text-[#1e4022] text-[13px] uppercase">Otros Datos</h3>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="grid grid-cols-[80px_1fr] text-[12px] mb-4">
                    <p className="text-slate-900 font-bold">Precintos:</p>
                    <p className="text-slate-900 border-b border-dotted border-slate-300 uppercase pb-1">{tiquete.precintos || 'TRANSPORTADOR'}</p>
                  </div>
                  <p className="text-slate-900 text-[12px] font-bold mb-2">Observaciones:</p>
                  <div className="flex-1 border border-dotted border-slate-400 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-800 leading-relaxed">
                    {tiquete.observaciones || <span className="text-transparent selection:text-transparent">.</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Signatures & QR */}
            <div className="mt-auto grid grid-cols-[1fr_1fr_auto] gap-4 items-end mb-2">
              <div className="border-2 border-[#1e4022] rounded-xl p-4 flex flex-col h-[150px]">
                <h4 className="text-center text-[11px] font-black text-[#1e4022] mb-auto">OPERADOR BÁSCULA</h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-[60px_1fr] items-end">
                    <p className="text-[12px] font-bold text-slate-900">Nombre:</p>
                    <div className="border-b border-slate-500 h-6"></div>
                  </div>
                  <div className="grid grid-cols-[60px_1fr] items-end">
                    <p className="text-[12px] font-bold text-slate-900">Firma:</p>
                    <div className="border-b border-slate-500 h-6"></div>
                  </div>
                </div>
              </div>
              <div className="border-2 border-[#1e4022] rounded-xl p-4 flex flex-col h-[150px]">
                <h4 className="text-center text-[11px] font-black text-[#1e4022] mb-auto">RESPONSABLE RECEPCIÓN</h4>
                <div className="space-y-6">
                  <div className="grid grid-cols-[60px_1fr] items-end">
                    <p className="text-[12px] font-bold text-slate-900">Nombre:</p>
                    <div className="border-b border-slate-500 h-6"></div>
                  </div>
                  <div className="grid grid-cols-[60px_1fr] items-end">
                    <p className="text-[12px] font-bold text-slate-900">Firma:</p>
                    <div className="border-b border-slate-500 h-6"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 border-2 border-slate-300 bg-slate-50 rounded-xl p-3 h-[150px]">
                <QRCodeSVG value={verificationUrl} size={110} level="M" />
                <div className="w-[180px] text-center space-y-3">
                  <div>
                    <p className="text-[11px] italic font-bold text-slate-900">Gracias por su confianza</p>
                    <p className="text-[10px] text-slate-700 italic leading-snug mt-1">Contribuimos al desarrollo del campo y la agroindustria sostenible.</p>
                  </div>
                  <div className="border-t border-slate-300 pt-2">
                    <p className="text-[9px] text-slate-600 leading-tight">Conserve este tiquete para cualquier reclamación o verificación.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Banner */}
            <div className="bg-[#1e4022] text-white text-center py-2.5 text-[12px] font-bold rounded">
              Este tiquete no tiene validez sin sello y firma.
            </div>
          </div>
        </div>

        {/* Actions (Not Printed, Outside Ticket) */}
        <div className="fixed top-4 right-4 print:hidden">
          <PrintButton />
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    return <div>Error cargando el tiquete</div>;
  }
}
