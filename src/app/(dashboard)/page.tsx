import { Activity, Scale, CheckCircle2, TrendingUp, History, ExternalLink, ArrowDownToLine, ArrowUpFromLine, Warehouse, Package } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Establecer zona horaria de Colombia (UTC-5) para los filtros del Dashboard
  const now = new Date();
  const bogotaFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric', month: 'numeric', day: 'numeric'
  });
  const [month, day, year] = bogotaFormatter.format(now).split('/');
  
  // startOfDay = 00:00:00 hora Colombia = 05:00:00 hora UTC
  const startOfDay = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 5, 0, 0, 0));
  // endOfDay = 23:59:59.999 hora Colombia = 04:59:59.999 del día siguiente en UTC
  const endOfDay = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 28, 59, 59, 999));

  // 1. Total Camiones Hoy (Any status, created today)
  const totalHoy = await prisma.tiquetes.count({
    where: {
      fechaEntrada: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });

  // 2. Balance de Fruta (Ingresos, Despachos e Inventario)
  const ingresosHoy = await prisma.tiquetes.aggregate({
    _sum: { pesoNeto: true },
    where: { estado: "CERRADO", tipo: "INGRESO", fechaEntrada: { gte: startOfDay, lte: endOfDay } }
  });
  const despachosHoy = await prisma.tiquetes.aggregate({
    _sum: { pesoNeto: true },
    where: { estado: "CERRADO", tipo: "DESPACHO", fechaEntrada: { gte: startOfDay, lte: endOfDay } }
  });
  const recibidasHoy = (ingresosHoy._sum.pesoNeto || 0) / 1000;
  const despachadasHoy = (despachosHoy._sum.pesoNeto || 0) / 1000;

  // Inventario Total Histórico
  const ingresosAllTime = await prisma.tiquetes.aggregate({
    _sum: { pesoNeto: true },
    where: { estado: "CERRADO", tipo: "INGRESO" }
  });
  const despachosAllTime = await prisma.tiquetes.aggregate({
    _sum: { pesoNeto: true },
    where: { estado: "CERRADO", tipo: "DESPACHO" }
  });
  const inventarioPatio = Math.max(0, ((ingresosAllTime._sum.pesoNeto || 0) - (despachosAllTime._sum.pesoNeto || 0)) / 1000);

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

      {/* Tarjeta de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tarjeta 1: Total Camiones Hoy -> Historial */}
        <Link href="/historial" className="bg-slate-900/50 backdrop-blur border border-slate-800 hover:border-slate-700 rounded-2xl p-5 hover:bg-slate-800/50 transition-all block">
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
        </Link>

        {/* Tarjeta 2: Balance de Fruta */}
        <Link href="/historial" className="bg-slate-900/50 backdrop-blur border border-slate-800 hover:border-slate-700 rounded-2xl p-5 hover:bg-slate-800/50 transition-all block lg:col-span-1">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-800/80 pb-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Package className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-bold text-white text-lg">Balance de Fruta</h3>
          </div>
          
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <ArrowDownToLine className="w-4 h-4" />
                <span className="text-sm font-medium">Recibido Hoy</span>
              </div>
              <span className="font-mono font-bold text-white">{recibidasHoy.toFixed(2)} t</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5 text-blue-400">
                <ArrowUpFromLine className="w-4 h-4" />
                <span className="text-sm font-medium">Despachado Hoy</span>
              </div>
              <span className="font-mono font-bold text-white">{despachadasHoy.toFixed(2)} t</span>
            </div>
            <div className="pt-3 mt-1 border-t border-slate-800/80 flex justify-between items-center bg-indigo-500/5 -mx-5 px-5 -mb-5 pb-5 rounded-b-2xl">
              <div className="flex items-center gap-2.5 text-indigo-400">
                <Warehouse className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Inventario Patio</span>
              </div>
              <span className="font-mono font-bold text-indigo-400 text-lg">{inventarioPatio.toFixed(2)} t</span>
            </div>
          </div>
        </Link>

        {/* Tarjeta 3: Camiones en Patio -> Historial (En Planta / Abiertos) */}
        <Link href="/historial?estado=ABIERTO" className="bg-slate-900/50 backdrop-blur border border-slate-800 hover:border-slate-700 rounded-2xl p-5 hover:bg-slate-800/50 transition-all block">
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
        </Link>

        {/* Tarjeta 4: Completados Hoy -> Historial (Cerrados) */}
        <Link href="/historial?estado=CERRADO" className="bg-slate-900/50 backdrop-blur border border-slate-800 hover:border-slate-700 rounded-2xl p-5 hover:bg-slate-800/50 transition-all block">
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
        </Link>

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
                <Link 
                  key={r.id} 
                  href={r.estado === "ABIERTO" ? `/historial?estado=ABIERTO&salida=${r.publicToken}` : `/imprimir/${r.publicToken}`} 
                  target={r.estado === "ABIERTO" ? undefined : "_blank"} 
                  className="flex items-center justify-between p-4 bg-slate-800/20 border border-slate-800/50 hover:border-slate-700 rounded-xl hover:bg-slate-800/30 transition-all flex hover:scale-[1.01] duration-200"
                >
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
                </Link>
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
