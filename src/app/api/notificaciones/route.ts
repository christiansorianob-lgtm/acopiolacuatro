import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Buscar todos los tiquetes abiertos
    const tiquetesAbiertos = await prisma.tiquetes.findMany({
      where: {
        estado: "ABIERTO"
      },
      select: {
        id: true,
        publicToken: true,
        placa: true,
        fechaEntrada: true,
      }
    });

    const now = new Date();
    const notifications = [];

    // Calcular rezagos (> 4 horas)
    for (const tiquete of tiquetesAbiertos) {
      const diffMs = now.getTime() - tiquete.fechaEntrada.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours >= 4) {
        // Redondear horas para mostrar
        const hours = Math.floor(diffHours);
        
        notifications.push({
          id: `rezago-${tiquete.id}`,
          tiqueteId: tiquete.id,
          title: "Camión Rezagado",
          description: `El vehículo ${tiquete.placa} lleva ${hours} horas en patio sin registrar salida.`,
          type: "warning", // Puede ser warning, info, error
          timeAgo: `${hours}h`,
          link: `/historial?estado=ABIERTO&salida=${tiquete.publicToken}`
        });
      }
    }

    // Ordenar notificaciones: los más rezagados primero
    notifications.sort((a, b) => {
      const aHours = parseInt(a.timeAgo.replace("h", ""));
      const bHours = parseInt(b.timeAgo.replace("h", ""));
      return bHours - aHours;
    });

    return NextResponse.json({ notifications });

  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
