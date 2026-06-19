"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PrintButton } from './PrintButton';
import { Modal } from '@/components/ui/Modal';

let hasTriggeredPrint = false;

export function TicketRenderer({ tiquete }: { tiquete: any }) {
  const searchParams = useSearchParams();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [telefonoDestinatario, setTelefonoDestinatario] = useState(tiquete.conductorTelefono || '');
  const [mensajeTexto, setMensajeTexto] = useState('');

  const handleOpenShareModal = () => {
    // Usamos siempre la URL canónica de producción para evitar el bloqueo de Vercel en URLs de preview
    const origin = "https://project-flxlg.vercel.app";
    const ticketUrl = `${origin}/imprimir/${tiquete.publicToken}`;
    const formattedNeto = tiquete.pesoNeto !== null ? `${tiquete.pesoNeto.toLocaleString('es-CO')} kg` : '---';
    const text = `Hola, te comparto el Tiquete de Pesaje N° ${String(tiquete.numero).padStart(6, '0')} de SOCIEDAD AGROVASPALMA S.A.S.\n\n` +
      `• Placa: ${tiquete.placa}\n` +
      `• Conductor: ${tiquete.conductorNombre}\n` +
      `• Producto: ${tiquete.productoNombre}\n` +
      `• Peso Neto: ${formattedNeto}\n\n` +
      `Puedes ver e imprimir el formato de tiquete aquí:\n${ticketUrl}`;
    
    setMensajeTexto(text);
    setIsShareModalOpen(true);
  };

  const handleSend = (via: 'web' | 'app') => {
    let cleanPhone = telefonoDestinatario.replace(/\D/g, '');
    if (!cleanPhone) {
      alert("Por favor ingresa un número de teléfono válido.");
      return;
    }
    
    if (cleanPhone.length === 10) {
      cleanPhone = '57' + cleanPhone;
    }
    
    const encodedText = encodeURIComponent(mensajeTexto);
    const url = via === 'web' 
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
      : `https://wa.me/${cleanPhone}?text=${encodedText}`;
      
    window.open(url, '_blank');
    setIsShareModalOpen(false);
  };

  useEffect(() => {
    if (searchParams.get('print') !== '1') return;
    if (hasTriggeredPrint) return;
    
    const timer = setTimeout(() => {
      if (!hasTriggeredPrint) {
        hasTriggeredPrint = true;
        window.print();
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchParams.get('print')]);

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
        font-size:9pt;
        color:#1a1a1a;
        overflow:hidden;
      ">
        
        <!-- ENCABEZADO -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:4px;border-bottom:2px solid #2e7d32;flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="/logo.png" style="width:60px;height:60px;object-fit:contain;" />
            <div>
              <div style="font-size:14pt;font-weight:900;line-height:1.1;">SOCIEDAD AGROVASPALMA S.A.S.</div>
              <div style="font-size:9pt;color:#444;">NIT: 901.666.764-5</div>
              <div style="font-size:9pt;color:#444;">📍 KDX 9-1 B Vrd Llano Grande - Norte de Santander</div>
              <div style="font-size:9pt;color:#444;">📞 315 393 0918 &nbsp;✉ facturacion@agrovaspalma.com</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11pt;font-weight:700;text-transform:uppercase;color:#2e7d32;">Tiquete de ${tiquete.tipo === 'DESPACHO' ? 'Despacho (Salida de Fruta)' : 'Ingreso (Entrada de Fruta)'}</div>
            <div style="font-size:24pt;font-weight:900;color:#c0392b;line-height:1;">#${String(tiquete.numero).padStart(6,'0')}</div>
            <div style="font-size:9pt;color:#444;">Fecha de emisión:</div>
            <div style="font-size:9.5pt;font-weight:700;">${tiquete.fechaEntrada}</div>
          </div>
        </div>

        <!-- FILA 1: PESAJE + VEHÍCULO -->
        <div class="fila-pesaje-vehiculo" style="display:grid;grid-template-columns:1fr 1fr;gap:4px;flex:2;min-height:0;">
          
          <div class="seccion" style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#2e7d32;font-size:10pt;margin-bottom:4px;">${iconoBalanza} PESAJE</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;font-size:9pt;">
              <div>
                <div style="color:#666;">Fecha y hora entrada:</div>
                <div style="font-weight:600;">${tiquete.fechaEntrada}</div>
                <div style="color:#666;margin-top:4px;">Fecha y hora salida:</div>
                <div style="font-weight:600;">${tiquete.fechaSalida || '---'}</div>
              </div>
              <div style="text-align:right;">
                <div style="color:#666;">Peso Entrada:</div>
                <div style="font-size:12pt;font-weight:700;">${tiquete.pesoEntrada?.toLocaleString('es-CO')} kg</div>
                <div style="color:#666;margin-top:4px;">Peso Salida:</div>
                <div style="font-size:12pt;font-weight:700;">${tiquete.pesoSalida !== null ? tiquete.pesoSalida.toLocaleString('es-CO') : '0'} kg</div>
              </div>
            </div>
            <div style="background:#e8f5e9;border:1.5px solid #a5d6a7;border-radius:6px;padding:6px 10px;margin-top:6px;display:flex;justify-content:space-between;align-items:center;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
              <span style="font-weight:700;font-size:11pt;color:#2e7d32;text-transform:uppercase;letter-spacing:0.5px;">PESO NETO:</span>
              <span style="font-size:20pt;font-weight:900;color:#1a1a1a;font-family:Arial,sans-serif;letter-spacing:-0.5px;">${tiquete.pesoNeto !== null ? tiquete.pesoNeto.toLocaleString('es-CO') : '---'} kg</span>
            </div>
          </div>

          <div class="seccion" style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#2e7d32;font-size:10pt;margin-bottom:4px;">${iconoCamion} VEHÍCULO Y CONDUCTOR</div>
            <div style="font-size:9pt;display:grid;grid-template-columns:auto 1fr;gap:2px 8px;">
              <span style="color:#666;">Placa:</span><span style="font-weight:700;font-size:11pt;text-transform:uppercase;">${tiquete.placa}</span>
              <span style="color:#666;">Tipo:</span><span style="font-weight:600;text-transform:uppercase;">${tiquete.vehiculoTipo || '---'}</span>
              <span style="color:#666;">Conductor:</span><span style="font-weight:600;text-transform:uppercase;">${tiquete.conductorNombre}</span>
              <span style="color:#666;">Cédula:</span><span>${tiquete.conductorCedula}</span>
            </div>
          </div>
        </div>

        <!-- FILA 2: PRODUCTO + OTROS DATOS -->
        <div class="fila-producto-datos" style="display:grid;grid-template-columns:1fr 1fr;gap:4px;flex:2;min-height:0;">
          
          <div class="seccion" style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#2e7d32;font-size:10pt;margin-bottom:4px;">${iconoPlanta} INFORMACIÓN DEL PRODUCTO</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px 8px;font-size:9pt;">
              <div><span style="color:#666;">Proveedor: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.proveedorNombre}</span></div>
              <div><span style="color:#666;">Origen: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.origenNombre || '---'}</span></div>
              <div><span style="color:#666;">Producto: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.productoNombre}</span></div>
              <div><span style="color:#666;">Destino: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.destinoNombre || '---'}</span></div>
              <div style="grid-column: span 2;"><span style="color:#666;">Remisión: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.remision || '---'}</span></div>
            </div>
          </div>

          <div class="seccion" style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#2e7d32;font-size:10pt;margin-bottom:4px;">${iconoDoc} OTROS DATOS</div>
            <div style="font-size:9pt;">
              <div><span style="color:#666;">Precintos: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.precintos || '---'}</span></div>
              <div style="color:#666;margin-top:3px;">Observaciones:</div>
              <div style="border:1px solid #ddd;border-radius:4px;flex-grow:1;padding:2px 4px;margin-top:2px;font-size:8.5pt;text-transform:uppercase;min-height:28px;">${tiquete.observaciones || ''}</div>
            </div>
          </div>
        </div>

        <!-- FILA 3: FIRMAS + QR -->
        <div class="fila-firmas" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;flex:1.2;min-height:0;">
          
          <div class="seccion" style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;font-size:9pt;">
            <div style="font-weight:700;text-align:center;">OPERADOR BÁSCULA</div>
            <div style="margin-top:auto;">Nombre: <span style="display:inline-block;width:75%;border-bottom:1px solid #333;">&nbsp;</span></div>
            <div style="margin-top:20px;">Firma: <span style="display:inline-block;width:75%;border-bottom:1px solid #333;">&nbsp;</span></div>
          </div>

          <div class="seccion" style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;font-size:9pt;">
            <div style="font-weight:700;text-align:center;">RESPONSABLE RECEPCIÓN</div>
            <div style="margin-top:auto;">Nombre: <span style="display:inline-block;width:75%;border-bottom:1px solid #333;">&nbsp;</span></div>
            <div style="margin-top:20px;">Firma: <span style="display:inline-block;width:75%;border-bottom:1px solid #333;">&nbsp;</span></div>
          </div>

          <div class="seccion" style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;justify-content:center;">
            <div style="display:flex;gap:6px;align-items:center;">
              <img src="${tiquete.qrUrl}" style="width:65px;height:65px;flex-shrink:0;" />
              <div style="font-size:7.5pt;color:#444;line-height:1.2;">
                <div style="font-weight:700;font-size:8pt;">Gracias por su confianza</div>
                <div style="font-style:italic;">Contribuimos al desarrollo del campo y la agroindustria sostenible.</div>
                <div style="margin-top:2px;">Conserve este tiquete para cualquier reclamación.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- PIE -->
        <div style="background:#2e7d32;color:white;text-align:center;font-size:9pt;font-weight:700;padding:6px;width:100%;border-radius:4px;flex-shrink:0;-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;">
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
            size: letter portrait;
            margin: 0;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #tiquete-wrapper-container {
            position: relative !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 9999 !important;
            background: white !important;
          }

          #tiquete-wrapper {
            width: 215.9mm !important;
            height: 139.7mm !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            padding: 2mm 3mm !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            border: 2px solid red !important;
          }

          #tiquete-wrapper .fila-pesaje-vehiculo,
          #tiquete-wrapper .fila-producto-datos,
          #tiquete-wrapper .fila-firmas {
            flex: none !important;
            min-height: 0 !important;
          }



          #tiquete-wrapper .seccion {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
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

      <div className="fixed bottom-8 right-8 print:hidden flex gap-3">
        <button
          onClick={handleOpenShareModal}
          className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.498 1.452 5.431 1.453 5.494 0 9.961-4.47 9.965-9.964.002-2.66-1.033-5.161-2.911-7.04-1.878-1.88-4.383-2.917-7.042-2.917-5.51 0-9.975 4.47-9.979 9.965-.001 1.914.502 3.79 1.456 5.414L1.756 21.8l4.891-1.284zm13.111-7.071c-.3-.15-1.772-.875-2.046-.975-.274-.1-.474-.15-.674.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.265-.467-2.41-1.485-.89-.794-1.49-1.775-1.665-2.075-.175-.3-.019-.462.13-.611.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.674-1.625-.924-2.225-.244-.589-.493-.51-.674-.519-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5s1.025 2.9 1.175 3.1c.15.2 2.016 3.08 4.885 4.316.682.294 1.214.47 1.629.602.685.218 1.309.187 1.802.114.55-.08 1.772-.725 2.022-1.425.25-.7.25-1.3 0-1.425-.075-.125-.275-.2-.575-.35z"/>
          </svg>
          Compartir WhatsApp
        </button>
        <PrintButton tiquete={tiquete} />
      </div>

      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Compartir por WhatsApp"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Número de Teléfono (Destinatario)</label>
            <input
              type="text"
              value={telefonoDestinatario}
              onChange={(e) => setTelefonoDestinatario(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              placeholder="Ej. 3153930918"
            />
            <p className="text-xs text-slate-500 mt-1">Ingresa el número con el código del país (ej. 57 para Colombia). Si ingresas 10 dígitos, se añadirá 57 automáticamente.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mensaje a Enviar</label>
            <textarea
              value={mensajeTexto}
              onChange={(e) => setMensajeTexto(e.target.value)}
              rows={7}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors text-sm font-sans resize-none"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleSend('web')}
              className="bg-emerald-750 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              WhatsApp Web
            </button>
            <button
              type="button"
              onClick={() => handleSend('app')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              WhatsApp App / Móvil
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
