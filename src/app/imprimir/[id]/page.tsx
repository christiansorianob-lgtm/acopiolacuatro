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
    
    // Generate QR Data URL
    const QRCode = require('qrcode');
    const qrUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', margin: 1 });

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center py-8">
        
        <div id="ticket-content" className="bg-white mx-auto text-black relative" style={{ width: '702px', height: '414px', padding: '4px', boxSizing: 'border-box' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .ticket-header {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              padding: 2px 4px;
            }
            .ticket-header img.logo {
              width: 50px !important;
              height: 50px !important;
              object-fit: contain !important;
              flex-shrink: 0;
            }
            .ticket-header .empresa-info {
              flex: 1;
              font-size: 6.5pt;
              line-height: 1.1;
            }
            .ticket-header .empresa-nombre {
              font-size: 10pt;
              font-weight: 900;
              line-height: 1.1;
            }
            .ticket-header .numero-tiquete {
              font-size: 18pt;
              font-weight: 900;
              color: #c0392b;
              line-height: 1;
            }

            .ticket-body {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2px;
              padding: 2px 4px;
            }

            .ticket-seccion {
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 3px 5px;
              font-size: 6.5pt;
              line-height: 1.2;
            }
            .ticket-seccion h3 {
              font-size: 7pt;
              font-weight: 700;
              margin: 0 0 2px 0;
              text-transform: uppercase;
              color: #2e7d32;
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .peso-neto {
              font-size: 12pt;
              font-weight: 900;
            }
            .peso-normal {
              font-size: 8pt;
              font-weight: 700;
            }

            .ticket-firmas {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 4px;
              padding: 2px 4px;
              font-size: 6.5pt;
            }
            .firma-bloque {
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 3px 5px;
            }
            .firma-linea {
              margin-top: 16px;
              border-bottom: 1px solid #333;
              margin-bottom: 2px;
            }

            .ticket-pie {
              background: #2e7d32;
              color: white;
              text-align: center;
              font-size: 6.5pt;
              font-weight: 700;
              padding: 2px;
              margin: 2px 4px 0;
              border-radius: 2px;
            }

            .qr-bloque {
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              gap: 4px;
              font-size: 5.5pt;
              padding: 2px;
            }
            .qr-bloque svg {
              width: 50px !important;
              height: 50px !important;
              flex-shrink: 0;
            }
            .grid-2 { display: grid; grid-template-columns: 70px 1fr; }
            .grid-2-veh { display: grid; grid-template-columns: 1fr 1fr; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            
            /* Dotted lines for Observaciones */
            .lineas-obs {
              margin-top: 2px;
              height: 32px;
              background-image: repeating-linear-gradient(transparent, transparent 15px, #ccc 15px, #ccc 16px);
              background-color: #f1f5f1;
              border-radius: 4px;
              padding: 2px 4px;
            }
            .bg-green-light {
              background-color: #eef5ef;
            }
          `}} />

          {/* Encabezado */}
          <div className="ticket-header" style={{ borderBottom: '2px solid #ccc', margin: '0 8px 4px 8px' }}>
            <img src="/logo.png" alt="Logo" className="logo" />
            <div className="empresa-info">
              <div className="empresa-nombre">SOCIEDAD AGROVASPALMA S.A.S.</div>
              <div>NIT: 901.666.764-5</div>
              <div>KDX 9-1 B Vrd Llano Grande - Norte de Santander</div>
              <div>315 393 0918 | facturacion@agrovaspalma.com</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12pt', fontWeight: 'bold' }}>TIQUETE DE PESAJE</div>
              <div className="numero-tiquete">#{tiquete.numero.toString().padStart(6, '0')}</div>
              <div style={{ fontSize: '8pt' }}>Fecha de emisión:<br/>{formatearFecha(tiquete.fechaEntrada)}</div>
            </div>
          </div>

          <div className="ticket-body">
            {/* PESAJE */}
            <div className="ticket-seccion">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
                PESAJE
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <div className="font-bold">Fecha y hora entrada:</div>
                  <div style={{ borderBottom: '1px dotted #ccc', paddingBottom: '2px', marginBottom: '4px' }}>{formatearFecha(tiquete.fechaEntrada)}</div>
                  <div className="font-bold">Fecha y hora salida:</div>
                  <div style={{ borderBottom: '1px dotted #ccc', paddingBottom: '2px' }}>{tiquete.fechaSalida ? formatearFecha(tiquete.fechaSalida) : '---'}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span>Peso Entrada:</span>
                    <span className="peso-normal">{tiquete.pesoEntrada} kg</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '4px' }}>
                    <span>Peso Salida:</span>
                    <span className="peso-normal">{tiquete.pesoSalida !== null ? `${tiquete.pesoSalida} kg` : '0 kg'}</span>
                  </div>
                  <div className="bg-green-light" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px', borderRadius: '4px' }}>
                    <span className="font-bold" style={{ color: '#2e7d32', fontSize: '10pt' }}>PESO NETO:</span>
                    <span className="peso-neto" style={{ color: '#2e7d32' }}>{tiquete.pesoNeto !== null ? `${tiquete.pesoNeto} kg` : '---'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VEHÍCULO Y CONDUCTOR */}
            <div className="ticket-seccion">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                VEHÍCULO Y CONDUCTOR
              </h3>
              <div className="grid-2-veh" style={{ marginBottom: '4px' }}>
                <div><div className="font-bold">Placa:</div><div className="uppercase font-bold">{tiquete.placa}</div></div>
                <div style={{ textAlign: 'right' }}><div className="font-bold">Tipo de vehículo:</div><div className="uppercase">TRACTOCAMIÓN</div></div>
              </div>
              <div className="grid-2">
                <span className="font-bold">Conductor:</span> <span className="uppercase">{tiquete.conductorNombre}</span>
                <span className="font-bold">Cédula:</span> <span className="uppercase">{tiquete.conductorNombre?.split(' ').slice(-1)[0] || '---'}</span>
                <span className="font-bold">Transportador:</span> <span className="uppercase">TRANSPORTADOR</span>
              </div>
            </div>

            {/* INFORMACIÓN DEL PRODUCTO */}
            <div className="ticket-seccion">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>
                INFORMACIÓN DEL PRODUCTO
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px' }}>
                <div className="grid-2">
                  <span className="font-bold">Proveedor:</span> <span className="uppercase">{tiquete.proveedorNombre || 'TERCERO'}</span>
                  <span className="font-bold">Producto:</span> <span className="uppercase">{tiquete.productoNombre || 'PRODUCTO'}</span>
                  <span className="font-bold">Origen:</span> <span className="uppercase">{tiquete.origenNombre || 'ORIGEN'}</span>
                  <span className="font-bold">Destino:</span> <span className="uppercase">{tiquete.destinoNombre || 'DESTINO'}</span>
                  <span className="font-bold">Remisión:</span> <span className="uppercase">{tiquete.remision || 'REMISIÓN'}</span>
                </div>
              </div>
            </div>

            {/* OTROS DATOS */}
            <div className="ticket-seccion">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
                OTROS DATOS
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr' }}>
                <span className="font-bold">Precintos:</span> <span className="uppercase">{tiquete.precintos || '---'}</span>
              </div>
              <div className="font-bold" style={{ marginTop: '4px' }}>Observaciones:</div>
              <div className="lineas-obs uppercase text-[7pt]">{tiquete.observaciones || ''}</div>
            </div>
          </div>

          <div className="ticket-firmas">
            <div className="firma-bloque">
              <div className="font-bold text-center">OPERADOR BÁSCULA</div>
              <div style={{ marginTop: '8px' }}><span className="font-bold">Nombre:</span> ______________________</div>
              <div style={{ marginTop: '22px' }}><span className="font-bold">Firma:</span> ______________________</div>
            </div>
            <div className="firma-bloque">
              <div className="font-bold text-center">RESPONSABLE RECEPCIÓN</div>
              <div style={{ marginTop: '8px' }}><span className="font-bold">Nombre:</span> ______________________</div>
              <div style={{ marginTop: '22px' }}><span className="font-bold">Firma:</span> ______________________</div>
            </div>
            <div className="qr-bloque" style={{ border: '1px solid #ccc', borderRadius: '6px' }}>
              <QRCodeSVG value={verificationUrl} size={70} level="H" />
              <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '6.5pt' }}>
                <strong>Gracias por su confianza</strong><br/>
                Contribuimos al desarrollo del campo y la agroindustria sostenible.<br/><br/>
                <span style={{ fontSize: '5.5pt', fontStyle: 'normal' }}>Conserve este tiquete para cualquier reclamación o verificación.</span>
              </div>
            </div>
          </div>

          <div className="ticket-pie">
            Este tiquete no tiene validez sin sello y firma.
          </div>

        </div>

        <div className="fixed bottom-8 right-8">
          <PrintButton 
            tiquete={{
              numero: tiquete.numero,
              fechaEntrada: formatearFecha(tiquete.fechaEntrada),
              fechaSalida: tiquete.fechaSalida ? formatearFecha(tiquete.fechaSalida) : null,
              pesoEntrada: tiquete.pesoEntrada,
              pesoSalida: tiquete.pesoSalida,
              pesoNeto: tiquete.pesoNeto,
              placa: tiquete.placa,
              conductorNombre: tiquete.conductorNombre,
              conductorCedula: tiquete.conductorNombre?.split(' ').slice(-1)[0] || '---',
              proveedorNombre: tiquete.proveedorNombre || 'TERCERO',
              productoNombre: tiquete.productoNombre || 'PRODUCTO',
              origenNombre: tiquete.origenNombre,
              destinoNombre: tiquete.destinoNombre,
              remision: tiquete.remision,
              precintos: tiquete.precintos,
              observaciones: tiquete.observaciones,
              qrUrl: qrUrl
            }}
          />
        </div>
      </div>
    );
  } catch (e) {
    return notFound();
  }
}
