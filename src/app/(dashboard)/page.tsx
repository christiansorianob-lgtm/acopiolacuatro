import { Activity, Scale, CheckCircle2, TrendingUp, History, ExternalLink } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Get today's start and end dates
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Total Camiones Hoy (Any status, created today)
  const totalHoy = await prisma.tiquetes.count({
    where: {
      fechaEntrada: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  // 2. Toneladas Recibidas Hoy (Sum of pesoNeto for closed tickets today)
  const aggregateNeto = await prisma.tiquetes.aggregate({
    _sum: {
      pesoNeto: true
    },
    where: {
      estado: "CERRADO",
      fechaEntrada: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });
  const toneladasHoy = ((aggregateNeto._sum.pesoNeto || 0) / 1000).toFixed(2);

  // 3. Camiones en Patio (Any ticket currently ABIERTO)
  const enPatio = await prisma.tiquetes.count({
    where: {
      estado: "ABIERTO"
    }
  });

  // 4. Completados (Closed tickets today)
  const completados = await prisma.tiquetes.count({
    where: {
      estado: "CERRADO",
      fechaEntrada: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  // 5. Recent Activity
  const recientes = await prisma.tiquetes.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  const formatHora = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Resumen de Hoy</h1>
        <p className="text-slate-400 mt-1">Actividad de la báscula y métricas clave en tiempo real.</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tarjeta 1 */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Camiones Hoy</p>
              <h3 className="text-3xl font-bold text-white mt-2">{totalHoy}</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-500">Registrados desde las 00:00</span>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Toneladas Recibidas</p>
              <h3 className="text-3xl font-bold text-white mt-2">{toneladasHoy} t</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Scale className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-500">Peso Neto (Cerrados hoy)</span>
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Camiones en Patio</p>
              <h3 className="text-3xl font-bold text-white mt-2">{enPatio}</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-amber-400 font-medium">Esperando salida</span>
          </div>
        </div>

        {/* Tarjeta 4 */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Completados Hoy</p>
              <h3 className="text-3xl font-bold text-white mt-2">{completados}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-500">Tiquetes cerrados con éxito</span>
          </div>
        </div>

      </div>

      {/* Espacio para gráficos o listado reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 min-h-[300px]">
          <h3 className="text-lg font-semibold text-white mb-4">Ingresos Recientes</h3>
          {recientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <History className="w-12 h-12 mb-3 opacity-20" />
              <p>No hay pesajes registrados todavía.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recientes.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-slate-800/20 border border-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="px-3 h-12 bg-slate-800 rounded-lg flex flex-col items-center justify-center font-bold text-cyan-400 border border-slate-700 text-sm whitespace-nowrap">
                      {formatHora(r.fechaEntrada)}
                    </div>
                    <div>
                      <p className="font-bold text-white tracking-widest">{r.placa}</p>
                      <p className="text-sm text-slate-400">{r.conductorNombre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-slate-300">{r.pesoEntrada} Kg</p>
                    {r.estado === "ABIERTO" ? (
                      <span className="text-xs font-medium text-amber-500">En Planta</span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-400">Neto: {r.pesoNeto} Kg</span>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-2 text-center">
                <Link href="/historial" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1">
                  Ver historial completo <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 min-h-[300px]">
          <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Link href="/recepcion" className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20">
              <Scale className="w-5 h-5" />
              Nuevo Pesaje
            </Link>
            <Link href="/historial" className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600">
              <History className="w-5 h-5" />
              Historial / Despacho
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
