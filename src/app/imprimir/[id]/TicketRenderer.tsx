"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PrintButton } from './PrintButton';

export function TicketRenderer({ tiquete }: { tiquete: any }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('print') === '1') {
      setTimeout(() => {
        window.print();
      }, 2000);
    }
  }, [searchParams]);

  const generarHTMLTiquete = (tiquete: any) => {
    const iconoBalanza = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`;
    const iconoCamion = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>`;
    const iconoPlanta = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.1 2.5 3.4 2-3.3.5-6.3-1-8.4a5.5 5.5 0 0 0-5 6c.1.9.3 1.9.9 2.6.2.3.5.5.8.7.4-.9.9-1.9 1.8-2.3Z"/></svg>`;
    const iconoDoc = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>`;

    return `
      <div style="
        width:100%;
        height:100%;
        display:flex;
        flex-direction:column;
        gap:3px;
        font-family:Arial,sans-serif;
        font-size:7pt;
        color:#1a1a1a;
        overflow:hidden;
      ">
        
        <!-- ENCABEZADO -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:4px;border-bottom:2px solid #2e7d32;flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="/logo.png" style="width:60px;height:60px;object-fit:contain;" />
            <div>
              <div style="font-size:12pt;font-weight:900;line-height:1.1;">SOCIEDAD AGROVASPALMA S.A.S.</div>
              <div style="font-size:7pt;color:#444;">NIT: 901.666.764-5</div>
              <div style="font-size:7pt;color:#444;">📍 KDX 9-1 B Vrd Llano Grande - Norte de Santander</div>
              <div style="font-size:7pt;color:#444;">📞 315 393 0918 &nbsp;✉ facturacion@agrovaspalma.com</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:9pt;font-weight:700;text-transform:uppercase;">Tiquete de Pesaje</div>
            <div style="font-size:22pt;font-weight:900;color:#c0392b;line-height:1;">#${String(tiquete.numero).padStart(6,'0')}</div>
            <div style="font-size:7pt;color:#444;">Fecha de emisión:</div>
            <div style="font-size:7.5pt;font-weight:700;">${tiquete.fechaEntrada}</div>
          </div>
        </div>

        <!-- FILA 1: PESAJE + VEHÍCULO -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;flex:2;min-height:0;">
          
          <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#2e7d32;font-size:8pt;margin-bottom:4px;">${iconoBalanza} PESAJE</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;font-size:7pt;">
              <div>
                <div style="color:#666;">Fecha y hora entrada:</div>
                <div style="font-weight:600;">${tiquete.fechaEntrada}</div>
                <div style="color:#666;margin-top:4px;">Fecha y hora salida:</div>
                <div style="font-weight:600;">${tiquete.fechaSalida || '---'}</div>
              </div>
              <div style="text-align:right;">
                <div style="color:#666;">Peso Entrada:</div>
                <div style="font-size:10pt;font-weight:700;">${tiquete.pesoEntrada?.toLocaleString('es-CO')} kg</div>
                <div style="color:#666;margin-top:4px;">Peso Salida:</div>
                <div style="font-size:10pt;font-weight:700;">${tiquete.pesoSalida !== null ? tiquete.pesoSalida.toLocaleString('es-CO') : '0'} kg</div>
              </div>
            </div>
            <div style="background:#e8f5e9;border-radius:4px;padding:4px 6px;margin-top:auto;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;font-size:8pt;color:#2e7d32;">PESO NETO:</span>
              <span style="font-size:14pt;font-weight:900;color:#1a1a1a;">${tiquete.pesoNeto !== null ? tiquete.pesoNeto.toLocaleString('es-CO') : '---'} kg</span>
            </div>
          </div>

          <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#2e7d32;font-size:8pt;margin-bottom:4px;">${iconoCamion} VEHÍCULO Y CONDUCTOR</div>
            <div style="font-size:7pt;display:grid;grid-template-columns:auto 1fr;gap:2px 8px;">
              <span style="color:#666;">Placa:</span><span style="font-weight:700;font-size:9pt;text-transform:uppercase;">${tiquete.placa}</span>
              <span style="color:#666;">Tipo:</span><span style="font-weight:600;">TRACTOCAMIÓN</span>
              <span style="color:#666;">Conductor:</span><span style="font-weight:600;text-transform:uppercase;">${tiquete.conductorNombre}</span>
              <span style="color:#666;">Cédula:</span><span>${tiquete.conductorCedula}</span>
              <span style="color:#666;">Transportador:</span><span>TRANSPORTADOR</span>
            </div>
          </div>
        </div>

        <!-- FILA 2: PRODUCTO + OTROS DATOS -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;flex:2;min-height:0;">
          
          <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#2e7d32;font-size:8pt;margin-bottom:4px;">${iconoPlanta} INFORMACIÓN DEL PRODUCTO</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px 8px;font-size:7pt;">
              <div><span style="color:#666;">Proveedor: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.proveedorNombre}</span></div>
              <div><span style="color:#666;">Origen: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.origenNombre || '---'}</span></div>
              <div><span style="color:#666;">Producto: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.productoNombre}</span></div>
              <div><span style="color:#666;">Destino: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.destinoNombre || '---'}</span></div>
              <div style="grid-column: span 2;"><span style="color:#666;">Remisión: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.remision || '---'}</span></div>
            </div>
          </div>

          <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#2e7d32;font-size:8pt;margin-bottom:4px;">${iconoDoc} OTROS DATOS</div>
            <div style="font-size:7pt;">
              <div><span style="color:#666;">Precintos: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.precintos || '---'}</span></div>
              <div style="color:#666;margin-top:3px;">Observaciones:</div>
              <div style="border:1px solid #ddd;border-radius:4px;flex-grow:1;padding:2px 4px;margin-top:2px;font-size:6.5pt;text-transform:uppercase;min-height:28px;">${tiquete.observaciones || ''}</div>
            </div>
          </div>
        </div>

        <!-- FILA 3: FIRMAS + QR -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;flex:1.5;min-height:0;">
          
          <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;font-size:7pt;">
            <div style="font-weight:700;text-align:center;margin-bottom:auto;">OPERADOR BÁSCULA</div>
            <div>Nombre: <span style="display:inline-block;width:80%;border-bottom:1px solid #333;">&nbsp;</span></div>
            <div style="margin-top:8px;">Firma: <span style="display:inline-block;width:80%;border-bottom:1px solid #333;">&nbsp;</span></div>
          </div>

          <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;font-size:7pt;">
            <div style="font-weight:700;text-align:center;margin-bottom:auto;">RESPONSABLE RECEPCIÓN</div>
            <div>Nombre: <span style="display:inline-block;width:80%;border-bottom:1px solid #333;">&nbsp;</span></div>
            <div style="margin-top:8px;">Firma: <span style="display:inline-block;width:80%;border-bottom:1px solid #333;">&nbsp;</span></div>
          </div>

          <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;justify-content:center;">
            <div style="display:flex;gap:6px;align-items:center;">
              <img src="${tiquete.qrUrl}" style="width:55px;height:55px;flex-shrink:0;" />
              <div style="font-size:5.5pt;color:#444;line-height:1.2;">
                <div style="font-weight:700;font-size:6pt;">Gracias por su confianza</div>
                <div style="font-style:italic;">Contribuimos al desarrollo del campo y la agroindustria sostenible.</div>
                <div style="margin-top:2px;">Conserve este tiquete para cualquier reclamación.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- PIE -->
        <div style="background:#2e7d32;color:white;text-align:center;font-size:7pt;font-weight:700;padding:4px;border-radius:4px;flex-shrink:0;">
          Este tiquete no tiene validez sin sello y firma.
        </div>

      </div>
    `;
  };

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white flex flex-col items-center justify-center py-8 print:py-0 print:block">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: 8.5in 5.5in;
            margin: 5mm 6mm;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #tiquete-wrapper {
            width: 100% !important;
            overflow: hidden !important;
          }
        }

        @media screen {
          #tiquete-wrapper {
            width: 8.5in;
            min-height: 5.5in;
            margin: 20px auto;
            padding: 10mm;
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          }
        }
      `}} />

      <div id="tiquete-wrapper-container" className="w-full h-full flex items-center justify-center print:block print:w-full print:h-full">
        <div id="tiquete-wrapper" dangerouslySetInnerHTML={{ __html: generarHTMLTiquete(tiquete) }} />
      </div>

      <div className="fixed bottom-8 right-8 print:hidden">
        <PrintButton tiquete={tiquete} />
      </div>
    </div>
  );
}
