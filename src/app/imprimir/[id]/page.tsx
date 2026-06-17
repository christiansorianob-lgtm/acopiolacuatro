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
        <div id="ticket-content" className="bg-white mx-auto text-black relative" style={{ width: '8.5in', height: '5.5in', overflow: 'hidden' }}>
          <style dangerouslySetInnerHTML={{__html: `
            /* Encabezado */
            .ticket-header {
              display: flex;
              align-items: flex-start;
              gap: 12px;
              padding: 6px 8px;
            }
            .ticket-header img.logo {
              width: 65px !important;
              height: 65px !important;
              object-fit: contain;
              flex-shrink: 0;
            }
            .ticket-header .empresa-info {
              flex: 1;
              font-size: 7.5pt;
              line-height: 1.3;
            }
            .ticket-header .empresa-nombre {
              font-size: 12pt;
              font-weight: 900;
              line-height: 1.2;
            }
            .ticket-header .numero-tiquete {
              font-size: 22pt;
              font-weight: 900;
              color: #c0392b;
              line-height: 1;
            }

            /* Grilla principal: 2 columnas */
            .ticket-body {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 4px;
              padding: 4px 8px;
            }

            /* Secciones */
            .ticket-seccion {
              border: 1px solid #ccc;
              border-radius: 6px;
              padding: 5px 7px;
              font-size: 7pt;
              line-height: 1.4;
            }
            .ticket-seccion h3 {
              font-size: 7.5pt;
              font-weight: 700;
              margin: 0 0 4px 0;
              text-transform: uppercase;
              color: #2e7d32;
              display: flex;
              align-items: center;
              gap: 4px;
            }

            /* Pesos destacados */
            .peso-neto {
              font-size: 14pt;
              font-weight: 900;
            }
            .peso-normal {
              font-size: 10pt;
              font-weight: 700;
            }

            /* Firmas */
            .ticket-firmas {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 8px;
              padding: 4px 8px;
              font-size: 7pt;
            }
            .firma-bloque {
              border: 1px solid #ccc;
              border-radius: 6px;
              padding: 5px 7px;
            }
            .firma-linea {
              margin-top: 24px;
              border-bottom: 1px solid #333;
              margin-bottom: 3px;
            }

            /* Pie */
            .ticket-pie {
              background: #2e7d32;
              color: white;
              text-align: center;
              font-size: 7pt;
              font-weight: 700;
              padding: 4px;
              margin: 4px 8px 0;
              border-radius: 4px;
            }

            /* QR */
            .qr-bloque {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-size: 6pt;
              text-align: center;
              padding: 4px;
            }
            .qr-bloque img, .qr-bloque svg {
              width: 70px !important;
              height: 70px !important;
            }
            .flex-row { display: flex; justify-content: space-between; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
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
              <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>TIQUETE DE PESAJE</div>
              <div className="numero-tiquete">#{tiquete.numero.toString().padStart(6, '0')}</div>
              <div style={{ fontSize: '8pt' }}>{formatearFecha(tiquete.fechaEntrada)}</div>
            </div>
          </div>

          <div className="ticket-body">
            {/* Vehículo */}
            <div className="ticket-seccion">
              <h3>Vehículo y Conductor</h3>
              <div className="flex-row">
                <div><span className="font-bold">Placa:</span> <span className="uppercase">{tiquete.placa}</span></div>
                <div><span className="font-bold">Vehículo:</span> <span className="uppercase">TRACTOCAMIÓN</span></div>
              </div>
              <div><span className="font-bold">Conductor:</span> <span className="uppercase">{tiquete.conductorNombre}</span></div>
              <div><span className="font-bold">Cédula:</span> <span className="uppercase">{tiquete.conductorNombre?.split(' ').slice(-1)[0] || '---'}</span></div>
            </div>

            {/* Producto */}
            <div className="ticket-seccion">
              <h3>Información del Producto</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
                <div><span className="font-bold">Proveedor:</span> <span className="uppercase">{tiquete.proveedorNombre || 'TERCERO'}</span></div>
                <div><span className="font-bold">Origen:</span> <span className="uppercase">{tiquete.origenNombre || 'ORIGEN'}</span></div>
                <div><span className="font-bold">Producto:</span> <span className="uppercase">{tiquete.productoNombre || 'PRODUCTO'}</span></div>
                <div><span className="font-bold">Destino:</span> <span className="uppercase">{tiquete.destinoNombre || 'DESTINO'}</span></div>
                <div style={{ gridColumn: 'span 2' }}><span className="font-bold">Remisión:</span> <span className="uppercase">{tiquete.remision || 'REMISIÓN'}</span></div>
              </div>
            </div>

            {/* Pesos */}
            <div className="ticket-seccion">
              <h3>Registro de Pesaje</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                <div>
                  <div className="font-bold">ENTRADA</div>
                  <div className="peso-normal">{tiquete.pesoEntrada} kg</div>
                  <div style={{ fontSize: '6pt' }}>{formatearFecha(tiquete.fechaEntrada)}</div>
                </div>
                <div>
                  <div className="font-bold">SALIDA</div>
                  <div className="peso-normal">{tiquete.pesoSalida !== null ? `${tiquete.pesoSalida} kg` : '0 kg'}</div>
                  <div style={{ fontSize: '6pt' }}>{tiquete.fechaSalida ? formatearFecha(tiquete.fechaSalida) : '---'}</div>
                </div>
                <div style={{ background: '#eef5ef', padding: '2px 6px', borderRadius: '4px' }}>
                  <div className="font-bold" style={{ color: '#2e7d32' }}>NETO</div>
                  <div className="peso-neto" style={{ color: '#2e7d32' }}>{tiquete.pesoNeto !== null ? `${tiquete.pesoNeto} kg` : '---'}</div>
                </div>
              </div>
            </div>

            {/* Otros */}
            <div className="ticket-seccion">
              <h3>Otros Datos</h3>
              <div style={{ marginBottom: '2px' }}><span className="font-bold">Precintos:</span> <span className="uppercase">{tiquete.precintos || '---'}</span></div>
              <div><span className="font-bold">Observaciones:</span> <span className="uppercase">{tiquete.observaciones || '---'}</span></div>
            </div>
          </div>

          <div className="ticket-firmas">
            <div className="firma-bloque" style={{ textAlign: 'center' }}>
              <div className="firma-linea"></div>
              <div className="font-bold">OPERADOR BÁSCULA</div>
            </div>
            <div className="firma-bloque" style={{ textAlign: 'center' }}>
              <div className="firma-linea"></div>
              <div className="font-bold">CONDUCTOR / TRANSPORTADOR</div>
            </div>
            <div className="qr-bloque" style={{ border: '1px solid #ccc', borderRadius: '6px' }}>
              <QRCodeSVG value={verificationUrl} size={70} level="H" />
              <div style={{ marginTop: '2px', fontWeight: 'bold' }}>VERIFICAR QR</div>
            </div>
          </div>

          <div className="ticket-pie">
            DOCUMENTO INFORMATIVO DE PESAJE - NO VÁLIDO COMO FACTURA
          </div>

        </div>

        <div className="fixed bottom-8 right-8 print:hidden">
          <PrintButton />
        </div>
      </div>
    );
  } catch (e) {
    return notFound();
  }
}
