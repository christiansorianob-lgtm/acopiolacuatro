import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HistorialTable } from "./HistorialTable";

export const dynamic = 'force-dynamic';

export default async function HistorialPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch all tickets ordered by creation date descending
  // Include related user info just in case
  const tiquetes = await prisma.tiquetes.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      usuarioEntrada: { select: { nombre: true } },
      usuarioSalida: { select: { nombre: true } }
    }
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Historial de Pesajes</h1>
        <p className="text-slate-400 mt-1">Supervisa todos los movimientos, camiones en planta y pesajes finalizados.</p>
      </div>

      <div className="flex-1 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 overflow-hidden flex flex-col">
        <HistorialTable initialData={tiquetes} usuarioId={parseInt(session.user.id)} />
      </div>
    </div>
  );
}
