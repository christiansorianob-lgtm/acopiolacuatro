import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generarFirmaTiquete } from '@/lib/crypto';
import { headers } from 'next/headers';
import QRCode from 'qrcode';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    if (!id || id.length < 10) {
      return new NextResponse("Tiquete ID invalido", { status: 400 });
    }

    const tiqueteRaw = await prisma.tiquetes.findUnique({
      where: { publicToken: id },
      include: {
        usuarioEntrada: true,
        usuarioSalida: true,
        conductor: true,
        vehiculo: true,
      }
    });

    if (!tiqueteRaw) {
      return new NextResponse('Tiquete no encontrado', { status: 404 });
    }

    const formatearFecha = (fechaStr: Date | null | undefined) => {
      if (!fechaStr) return "N/A";
      try {
        const date = new Date(fechaStr);
        return date.toLocaleString("es-CO", { 
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit", hour12: true, timeZone: 'America/Bogota'
        }).toUpperCase();
      } catch (e) {
        return "FECHA INVÁLIDA";
      }
    };

    const firma = generarFirmaTiquete(tiqueteRaw);
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const verificationUrl = `${protocol}://${host}/verificar?t=${tiqueteRaw.numero}&firma=${firma}`;
    const qrUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: 'H', margin: 1 });

    const tiquete = {
      numero: tiqueteRaw.numero,
      fechaEntrada: formatearFecha(tiqueteRaw.fechaEntrada),
      fechaSalida: tiqueteRaw.fechaSalida ? formatearFecha(tiqueteRaw.fechaSalida) : null,
      pesoEntrada: tiqueteRaw.pesoEntrada,
      pesoSalida: tiqueteRaw.pesoSalida,
      pesoNeto: tiqueteRaw.pesoNeto,
      placa: tiqueteRaw.placa,
      conductorNombre: tiqueteRaw.conductorNombre,
      conductorCedula: tiqueteRaw.conductor?.cedula || '---',
      proveedorNombre: tiqueteRaw.proveedorNombre || 'TERCERO',
      productoNombre: tiqueteRaw.productoNombre || 'PRODUCTO',
      vehiculoTipo: tiqueteRaw.vehiculo?.tipo || '---',
      origenNombre: tiqueteRaw.origenNombre,
      destinoNombre: tiqueteRaw.destinoNombre,
      remision: tiqueteRaw.remision,
      precintos: tiqueteRaw.precintos,
      observaciones: tiqueteRaw.observaciones,
      qrUrl: qrUrl
    };

    const iconoBalanza = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`;
    const iconoCamion = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>`;
    const iconoPlanta = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.1 2.5 3.4 2-3.3.5-6.3-1-8.4a5.5 5.5 0 0 0-5 6c.1.9.3 1.9.9 2.6.2.3.5.5.8.7.4-.9.9-1.9 1.8-2.3Z"/></svg>`;
    const iconoDoc = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>`;

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>Impresión Tiquete #${String(tiquete.numero).padStart(6,'0')}</title>
  <style>
    @media print {
      @page {
        size: letter portrait;
        margin: 0;
      }
      .ticket-container {
        width: 215.9mm;
        height: 139.7mm;
        page-break-inside: avoid;
        box-sizing: border-box;
        overflow: hidden;
      }
    }
    html, body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: white;
      font-family: Arial, sans-serif;
    }
    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div class="ticket-container" style="
    padding: 4mm 6mm;
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 9pt;
    color: #1a1a1a;
  ">
    
    <!-- ENCABEZADO -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:4px;border-bottom:2px solid #2e7d32;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:8px;">
        <img src="${protocol}://${host}/logo.png" style="width:60px;height:60px;object-fit:contain;" />
        <div>
          <div style="font-size:14pt;font-weight:900;line-height:1.1;">SOCIEDAD AGROVASPALMA S.A.S.</div>
          <div style="font-size:9pt;color:#444;">NIT: 901.666.764-5</div>
          <div style="font-size:9pt;color:#444;">📍 KDX 9-1 B Vrd Llano Grande - Norte de Santander</div>
          <div style="font-size:9pt;color:#444;">📞 315 393 0918 &nbsp;✉ facturacion@agrovaspalma.com</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11pt;font-weight:700;text-transform:uppercase;">Tiquete de Pesaje</div>
        <div style="font-size:24pt;font-weight:900;color:#c0392b;line-height:1;">#${String(tiquete.numero).padStart(6,'0')}</div>
        <div style="font-size:9pt;color:#444;">Fecha de emisión:</div>
        <div style="font-size:9.5pt;font-weight:700;">${tiquete.fechaEntrada}</div>
      </div>
    </div>

    <!-- FILA 1: PESAJE + VEHÍCULO -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;flex:2;min-height:0;">
      <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
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
          <span style="font-size:20pt;font-weight:900;color:#1a1a1a;letter-spacing:-0.5px;">${tiquete.pesoNeto !== null ? tiquete.pesoNeto.toLocaleString('es-CO') : '---'} kg</span>
        </div>
      </div>

      <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
        <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#2e7d32;font-size:10pt;margin-bottom:4px;">${iconoCamion} VEHÍCULO Y CONDUCTOR</div>
        <div style="font-size:9pt;display:grid;grid-template-columns:auto 1fr;gap:2px 8px;">
          <span style="color:#666;">Placa:</span><span style="font-weight:700;font-size:11pt;text-transform:uppercase;">${tiquete.placa}</span>
          <span style="color:#666;">Tipo:</span><span style="font-weight:600;text-transform:uppercase;">${tiquete.vehiculoTipo}</span>
          <span style="color:#666;">Conductor:</span><span style="font-weight:600;text-transform:uppercase;">${tiquete.conductorNombre}</span>
          <span style="color:#666;">Cédula:</span><span>${tiquete.conductorCedula}</span>
        </div>
      </div>
    </div>

    <!-- FILA 2: PRODUCTO + OTROS DATOS -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;flex:2;min-height:0;">
      <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
        <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#2e7d32;font-size:10pt;margin-bottom:4px;">${iconoPlanta} INFORMACIÓN DEL PRODUCTO</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px 8px;font-size:9pt;">
          <div><span style="color:#666;">Proveedor: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.proveedorNombre}</span></div>
          <div><span style="color:#666;">Origen: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.origenNombre || '---'}</span></div>
          <div><span style="color:#666;">Producto: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.productoNombre}</span></div>
          <div><span style="color:#666;">Destino: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.destinoNombre || '---'}</span></div>
          <div style="grid-column: span 2;"><span style="color:#666;">Remisión: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.remision || '---'}</span></div>
        </div>
      </div>

      <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;">
        <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#2e7d32;font-size:10pt;margin-bottom:4px;">${iconoDoc} OTROS DATOS</div>
        <div style="font-size:9pt;">
          <div><span style="color:#666;">Precintos: </span><span style="font-weight:600;text-transform:uppercase;">${tiquete.precintos || '---'}</span></div>
          <div style="color:#666;margin-top:3px;">Observaciones:</div>
          <div style="border:1px solid #ddd;border-radius:4px;flex-grow:1;padding:2px 4px;margin-top:2px;font-size:8.5pt;text-transform:uppercase;min-height:28px;">${tiquete.observaciones || ''}</div>
        </div>
      </div>
    </div>

    <!-- FILA 3: FIRMAS + QR -->
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;flex:1.2;min-height:0;">
      <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;font-size:9pt;">
        <div style="font-weight:700;text-align:center;">OPERADOR BÁSCULA</div>
        <div style="margin-top:auto;">Nombre: <span style="display:inline-block;width:75%;border-bottom:1px solid #333;">&nbsp;</span></div>
        <div style="margin-top:20px;">Firma: <span style="display:inline-block;width:75%;border-bottom:1px solid #333;">&nbsp;</span></div>
      </div>

      <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;font-size:9pt;">
        <div style="font-weight:700;text-align:center;">RESPONSABLE RECEPCIÓN</div>
        <div style="margin-top:auto;">Nombre: <span style="display:inline-block;width:75%;border-bottom:1px solid #333;">&nbsp;</span></div>
        <div style="margin-top:20px;">Firma: <span style="display:inline-block;width:75%;border-bottom:1px solid #333;">&nbsp;</span></div>
      </div>

      <div style="border:1px solid #ccc;border-radius:6px;padding:4px 6px;display:flex;flex-direction:column;height:100%;overflow:hidden;justify-content:center;">
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
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error(error);
    return new NextResponse('Error interno', { status: 500 });
  }
}
