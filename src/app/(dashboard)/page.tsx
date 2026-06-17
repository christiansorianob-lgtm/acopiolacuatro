import { Activity, Scale, CheckCircle2, TrendingUp, History } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Resumen de Hoy</h1>
        <p className="text-slate-400 mt-1">Actividad de la báscula y métricas clave.</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Tarjeta 1 */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Camiones Hoy</p>
              <h3 className="text-3xl font-bold text-white mt-2">0</h3>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              0%
            </span>
            <span className="text-slate-500 ml-2">vs ayer</span>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Toneladas Recibidas</p>
              <h3 className="text-3xl font-bold text-white mt-2">0.00</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Scale className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-500">Kilos brutos hoy</span>
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Camiones en Patio</p>
              <h3 className="text-3xl font-bold text-white mt-2">0</h3>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <Activity className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-amber-400 font-medium">Pesaje inicial listo</span>
          </div>
        </div>

        {/* Tarjeta 4 */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 hover:bg-slate-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-400">Completados</p>
              <h3 className="text-3xl font-bold text-white mt-2">0</h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-500">Tiquetes cerrados hoy</span>
          </div>
        </div>

      </div>

      {/* Espacio para gráficos o listado reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 min-h-[300px]">
          <h3 className="text-lg font-semibold text-white mb-4">Ingresos Recientes</h3>
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <History className="w-12 h-12 mb-3 opacity-20" />
            <p>No hay pesajes registrados hoy.</p>
          </div>
        </div>
        
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 min-h-[300px]">
          <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Link href="/recepcion" className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              <Scale className="w-5 h-5" />
              Nuevo Pesaje
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
