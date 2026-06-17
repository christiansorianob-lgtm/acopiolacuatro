import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { TicketRenderer } from './TicketRenderer';
import { generarFirmaTiquete } from '@/lib/crypto';
import { headers } from 'next/headers';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: ' ',
};

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
      <TicketRenderer 
        tiquete={{
          id: tiquete.id,
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
    );
  } catch (e) {
    return notFound();
  }
}
