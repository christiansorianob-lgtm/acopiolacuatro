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
        <div id="ticket-content" className="bg-white mx-auto text-slate-900 overflow-hidden relative">
          
          <div className="h-full flex flex-col justify-between">
            
            {/* Header */}
            <div className="flex justify-between items-start header-empresa mb-1 border-b-[2px] border-slate-300 pb-2">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain shrink-0" />
                <div className="space-y-0.5">
                  <h1 className="text-[16px] font-black text-[#1e4022] tracking-tight m-0 p-0 leading-tight">SOCIEDAD AGROVASPALMA S.A.S.</h1>
                  <p className="text-[10px] font-bold text-slate-800 m-0 p-0">NIT: 901.666.764-5</p>
                  <p className="text-[9px] font-medium text-slate-800 m-0 p-0">KDX 9-1 B Vrd Llano Grande - Norte de Santander</p>
                  <p className="text-[9px] font-medium text-slate-800 m-0 p-0">315 393 0918 | facturacion@agrovaspalma.com</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-[14px] font-black uppercase tracking-wide text-slate-900 m-0 p-0 leading-tight">TIQUETE DE PESAJE</h2>
                <p className="text-[28px] font-black text-[#B91C1C] leading-none m-0 p-0">#{tiquete.numero.toString().padStart(6, '0')}</p>
                <p className="text-[9px] text-slate-600 m-0 p-0 mt-1">Fecha de emisión:</p>
                <p className="text-[10px] font-semibold text-slate-900 m-0 p-0">{formatearFecha(tiquete.fechaEntrada)}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-2">
              {/* Box 1: Vehículo */}
              <div className="flex-1 border border-[#1e4022] rounded-lg overflow-hidden">
                <div className="px-2 py-1 bg-[#1e4022]/5 flex items-center border-b border-[#1e4022]">
                  <h3 className="font-black text-[#1e4022] text-[10px] uppercase">Vehículo y Conductor</h3>
                </div>
                <div className="seccion text-[9px] space-y-1">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-bold">Placa:</span> <span className="uppercase text-[11px] font-black">{tiquete.placa}</span>
                    </div>
                    <div>
                      <span className="font-bold">Vehículo:</span> <span className="uppercase">TRACTOCAMIÓN</span>
                    </div>
                  </div>
                  <div><span className="font-bold">Conductor:</span> <span className="uppercase">{tiquete.conductorNombre}</span></div>
                  <div><span className="font-bold">Cédula:</span> <span className="uppercase">{tiquete.conductorNombre?.split(' ').slice(-1)[0] || '---'}</span></div>
                </div>
              </div>

              {/* Box 2: Producto */}
              <div className="flex-1 border border-[#1e4022] rounded-lg overflow-hidden">
                <div className="px-2 py-1 bg-[#1e4022]/5 flex items-center border-b border-[#1e4022]">
                  <h3 className="font-black text-[#1e4022] text-[10px] uppercase">Información del Producto</h3>
                </div>
                <div className="seccion text-[9px] grid grid-cols-2 gap-x-2 gap-y-1">
                  <div><span className="font-bold">Proveedor:</span> <span className="uppercase">{tiquete.proveedorNombre || 'TERCERO'}</span></div>
                  <div><span className="font-bold">Origen:</span> <span className="uppercase">{tiquete.origenNombre || 'ORIGEN'}</span></div>
                  <div><span className="font-bold">Producto:</span> <span className="uppercase">{tiquete.productoNombre || 'PRODUCTO'}</span></div>
                  <div><span className="font-bold">Destino:</span> <span className="uppercase">{tiquete.destinoNombre || 'DESTINO'}</span></div>
                  <div className="col-span-2"><span className="font-bold">Remisión:</span> <span className="uppercase">{tiquete.remision || 'REMISIÓN'}</span></div>
                </div>
              </div>
            </div>

            {/* Box 3: Pesos */}
            <div className="border border-[#1e4022] rounded-lg overflow-hidden mb-2">
              <div className="px-2 py-1 bg-[#1e4022]/5 flex items-center border-b border-[#1e4022]">
                <h3 className="font-black text-[#1e4022] text-[10px] uppercase">Registro de Pesaje</h3>
              </div>
              <div className="bloque-pesos grid grid-cols-3 gap-2 divide-x divide-slate-300">
                <div className="text-center">
                  <p className="text-[9px] font-bold">PESO ENTRADA</p>
                  <p className="text-[16px] font-black">{tiquete.pesoEntrada} kg</p>
                  <p className="text-[8px]">{formatearFecha(tiquete.fechaEntrada)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-bold">PESO SALIDA</p>
                  <p className="text-[16px] font-black">{tiquete.pesoSalida !== null ? `${tiquete.pesoSalida} kg` : '0 kg'}</p>
                  <p className="text-[8px]">{tiquete.fechaSalida ? formatearFecha(tiquete.fechaSalida) : '---'}</p>
                </div>
                <div className="text-center bg-[#eef5ef]">
                  <p className="text-[10px] font-bold text-[#1e4022]">PESO NETO</p>
                  <p className="text-[18px] font-black text-[#1e4022]">{tiquete.pesoNeto !== null ? `${tiquete.pesoNeto} kg` : '---'}</p>
                </div>
              </div>
            </div>

            {/* Box 4: Otros */}
            <div className="border border-[#1e4022] rounded-lg overflow-hidden mb-1">
              <div className="px-2 py-1 bg-[#1e4022]/5 flex items-center border-b border-[#1e4022]">
                <h3 className="font-black text-[#1e4022] text-[10px] uppercase">Otros Datos</h3>
              </div>
              <div className="seccion text-[9px]">
                <div className="mb-1"><span className="font-bold">Precintos:</span> <span className="uppercase">{tiquete.precintos || '---'}</span></div>
                <div><span className="font-bold">Observaciones:</span> <span className="uppercase">{tiquete.observaciones || '---'}</span></div>
              </div>
            </div>

            {/* Signatures & QR */}
            <div className="flex gap-4 items-end justify-between firmas mt-auto">
              <div className="flex-1 border border-[#1e4022] rounded-lg p-2 text-center">
                <div className="border-b border-slate-400 h-8 mb-1 w-3/4 mx-auto"></div>
                <h4 className="text-[9px] font-black text-[#1e4022]">OPERADOR BÁSCULA</h4>
              </div>
              <div className="flex-1 border border-[#1e4022] rounded-lg p-2 text-center">
                <div className="border-b border-slate-400 h-8 mb-1 w-3/4 mx-auto"></div>
                <h4 className="text-[9px] font-black text-[#1e4022]">CONDUCTOR / TRANSPORTADOR</h4>
              </div>
              
              <div className="shrink-0 flex flex-col items-center border border-[#1e4022] rounded-lg p-1.5 bg-white">
                <QRCodeSVG 
                  value={verificationUrl}
                  size={60}
                  level="H"
                  includeMargin={true}
                />
                <span className="text-[6px] font-bold text-slate-500 mt-0.5 tracking-wider uppercase">Verificar QR</span>
              </div>
            </div>

          </div>
        </div>
        
        {/* Print button outside wrapper */}
        <div className="fixed bottom-8 right-8 print:hidden">
          <PrintButton />
        </div>
      </div>
    );
  } catch (e) {
    return notFound();
  }
}
